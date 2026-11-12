
const CACHE_KEY = "globalCount";
const CACHE_DURATION = 60*1000; 

const LAMBDA_URL = "https://27irlz5j37nkz2pnm4j2f52ely0inpth.lambda-url.us-east-2.on.aws/";

let initializationPromise: Promise<void> | null = null;

let executedSinceLastUpdate = 0;
let localExecutedTotal = 0;
let globalCount = 0;

export function incrementInstructionExecution() {
    executedSinceLastUpdate++;
    localExecutedTotal++;
    globalCount++;
    updateDisplay();
}

export function initializeStats(): Promise<void> {
    if (!initializationPromise) {
        initializationPromise = fetchGlobalCount();
    }

    return initializationPromise;
}

let isFlushing = false;
export async function flushInstructionCount() {
    if (!initializationPromise || isFlushing) return;
    await initializationPromise;

    if (import.meta.env.DEV) console.log("flush called");
    if (executedSinceLastUpdate === 0) {
        if (import.meta.env.DEV) console.log("no instructions added");
        return;
    }

    isFlushing = true;

    const count = executedSinceLastUpdate;
    executedSinceLastUpdate = 0;

    try {
        if (import.meta.env.DEV) console.log(`adding ${count} instructions`);
        const response = await fetch(LAMBDA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ count }),
            keepalive: true,
        });

        const cached = sessionStorage.getItem(CACHE_KEY);

        try {
            if (cached) {

                sessionStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify({
                        count: globalCount,
                        timestamp: Date.now()
                    })
                );
            }
        }
        catch (error) {
            console.warn("Failed to update cached global count:", error);
            sessionStorage.removeItem(CACHE_KEY);
        }
    }
    catch (error) {
        executedSinceLastUpdate += count;
        console.error(error);
    }
    finally {
        isFlushing = false;
    }
}

export async function fetchGlobalCount(): Promise<void> {
    if (typeof document === "undefined") return;

    const element = document.getElementById("globalNumber");

    try {
        const cached = sessionStorage.getItem(CACHE_KEY);

        if(cached) {
            const { count, timestamp } = JSON.parse(cached);

            if (
                Number.isSafeInteger(count) &&
                count >= 0 &&
                Number.isFinite(timestamp) &&
                Date.now() - timestamp < CACHE_DURATION
            ) {
                if(import.meta.env.DEV) console.log("Pulled global from cache");
                globalCount = count + localExecutedTotal;
                updateDisplay();
                return;
            }
        }
        if (import.meta.env.DEV) console.log("Pulled global from db");
        const response = await fetch(LAMBDA_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!Number.isSafeInteger(data.count) || data.count < 0) {
            throw new Error("Invalid global count recieved");
        }

        globalCount = data.count + localExecutedTotal;
        sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
                count: globalCount,
                timestamp: Date.now(), 
            })
        );
        updateDisplay();
    } catch (error) {
        console.error("Failed to fetch global count:", error);
        if (element) {
            element.textContent = "---"
            element.title = "Failure to access db; try again later"
        }
    }
}

function updateDisplay() {
    if (typeof document === "undefined") return;

    const element = document.getElementById("globalNumber");
    if (element) {
        element.textContent = globalCount.toLocaleString();
    }
}