const LAMBDA_URL = "https://27irlz5j37nkz2pnm4j2f52ely0inpth.lambda-url.us-east-2.on.aws/";

let executedSinceLastUpdate = 0;

export function incrementInstructionExecution() {
    executedSinceLastUpdate++;
}

export async function flushInstructionCount() {
    if (import.meta.env.DEV) console.log("flush called");
    if (executedSinceLastUpdate === 0) {
        console.log("no instructions added");
        return;
    }

    const count = executedSinceLastUpdate;
    executedSinceLastUpdate = 0;

    try {
        if (import.meta.env.DEV) console.log(`adding ${count} instructions`);
        const response = await fetch(LAMBDA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ count })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
    }
    catch (error) {
        executedSinceLastUpdate += count;
        console.error(error);
    }

}