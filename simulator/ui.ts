import { CpuState } from "./core/types";

type MemoryWriteCallback = (address: number, value: number) => void;

let onMemoryWrite: MemoryWriteCallback | null = null;

export function set_memory_write_callback(
    callback: MemoryWriteCallback
): void {
    onMemoryWrite = callback;
}

export function update_registers_view(core: CpuState): void {
    const select = document.querySelectorAll<HTMLLIElement>(
        "#register-select li"
    );
    if (!select) return;

    for (let i = 0; i < core.registers.length; i++) {
        const value = core.registers[i].toString(16).toUpperCase().padStart(2, "0");
        const option = select[i];
        option.value = parseInt(value, 16);
        option.textContent = `R${i} = 0x${value}`;
    }
}

const MEMORY_SIZE = 256;

const memoryElements = new Map<number, HTMLElement>();

let activeInput: HTMLInputElement | null = null;
let activeCell: HTMLElement | null = null;

export function initialize_memory_view(): void {
    const grid = document.getElementById("memory-grid");
    if (!grid) return;

    grid.replaceChildren();
    memoryElements.clear();

    for (let addr = 0; addr < MEMORY_SIZE; addr++) {
        const cell = document.createElement("div");

        cell.className = "memory-cell";
        cell.dataset.addr = addr.toString(16).padStart(2, "0");
        cell.dataset.value = "0";

        set_cell_text(cell);

        cell.addEventListener("click", (e) => {
            e.stopPropagation();
            open_editor(cell);
        });

        grid.appendChild(cell);
        memoryElements.set(addr, cell);
    }
}

function set_cell_text(cell: HTMLElement): void {
    const addr = cell.dataset.addr!;
    const value = parseInt(cell.dataset.value!, 10);

    cell.replaceChildren();

    const addrEl = document.createElement("span");
    addrEl.className = "cell-addr";
    addrEl.textContent = `0x${addr}`;

    const valEl = document.createElement("span");
    valEl.className = "cell-val";
    valEl.textContent = `0x${value.toString(16).padStart(2, "0")}`;

    cell.append(addrEl, valEl);
}

export function update_memory_view(memory: number[]): void {
    memory.forEach((value, address) => {
        update_memory_cell(address, value);
    });
}

function open_editor(cell: HTMLElement): void {
    if (cell.classList.contains("editing")) return;

    cell.classList.add("editing");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "cell-input";
    input.value = `0x${parseInt(cell.dataset.value!, 10).toString(16).padStart(2, "0")}`;

    cell.replaceWith(input);

    activeInput = input;
    activeCell = cell;

    input.focus();
    input.select();

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            save_editor();
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancel_editor();
        }
    });

    input.addEventListener("blur", save_editor);
}

function parse_input(raw: string): number {
    const trimmed = raw.trim();
    const noSpaces = trimmed.replace(/\s+/g, "");

    if (!noSpaces) return 0;

    let value: number;

    if (/^0[xX]/.test(noSpaces)) {
        value = parseInt(noSpaces.slice(2), 16);
    } else if (/^0[bB]/.test(noSpaces)) {
        value = parseInt(noSpaces.slice(2), 2);
    } else if (/\s/.test(trimmed) || /^[bB]/.test(noSpaces)) {
        value = parseInt(noSpaces.replace(/^[bB]/, ""), 2);
    } else {
        value = parseInt(noSpaces, 10);
    }

    return isNaN(value) ? 0 : value & 0xff;
}

function save_editor(): void {
    if (!activeInput || !activeCell) return;

    const input = activeInput;
    const cell = activeCell;

    activeInput = null;
    activeCell = null;

    const value = parse_input(input.value);

    cell.dataset.value = value.toString();
    onMemoryWrite?.(parseInt(cell.dataset.addr!, 16), value);
    cell.classList.remove("editing");

    input.replaceWith(cell);
    set_cell_text(cell);
}

function cancel_editor(): void {
    if (!activeInput || !activeCell) return;

    const input = activeInput;
    const cell = activeCell;

    activeInput = null;
    activeCell = null;

    cell.classList.remove("editing");

    input.replaceWith(cell);
    set_cell_text(cell);
}

export function update_memory_cell(address: number, value: number): void {
    const cell = memoryElements.get(address);

    // console.log("Address:", address);
    // console.log("Cell:", cell);
    if (!cell) {
        console.warn(`no memory cell found for address ${address}`);
        return;
    };

    // console.log("Before:", cell.innerHTML);
    cell.dataset.value = value.toString();

    const valueElement = cell.querySelector(".cell-val");
    if (valueElement) {
        valueElement.textContent = `0x${value.toString(16).padStart(2, "0")}`;
    }
}

