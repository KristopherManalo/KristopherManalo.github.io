import { CpuState } from "./core/types";

export function update_registers(core: CpuState): void {
    const select = document.getElementById(
        "register-select"
    ) as HTMLSelectElement | null;
    if (!select) return;

    for (let i = 0; i < core.registers.length; i++) {
        const value = core.registers[i].toString(16).toUpperCase().padStart(2, "0");
        const option = select.options[i];
        option.value = `0x${value}`;
        option.textContent = `R${i} = 0x${value}`;
    }
    select.value =
        `0x${core.registers[select.selectedIndex]
            .toString(16)
            .toUpperCase()
            .padStart(2, "0")}`;
}

const MEMORY_SIZE = 256;

/**
 * Builds the memory address <select> with one option per byte address
 * (0x00 - 0xFF). Read-only UI setup — building options does not mutate the
 * simulator. Called once on load.
 */
export function populate_memory_select(select: HTMLSelectElement): void {
    select.replaceChildren();
    for (let address = 0; address < MEMORY_SIZE; address++) {
        const option = document.createElement("option");
        option.value = String(address);
        option.textContent = `0x${address
            .toString(16)
            .toUpperCase()
            .padStart(2, "0")}`;
        select.appendChild(option);
    }
}

/**
 * Reflects the currently selected address's live memory byte into the value
 * <input>. The <input> is the modifiable element, but its change is
 * intentionally NOT written back into the simulator — that wiring is left for
 * a later step.
 */
export function sync_memory_value(core: CpuState): void {
    const select = document.getElementById(
        "memory-select"
    ) as HTMLSelectElement | null;
    const valueInput = document.getElementById(
        "memory-value"
    ) as HTMLInputElement | null;
    if (!select || !valueInput) return;

    const address = select.selectedIndex;
    const value = core.memory[address] ?? 0;
    valueInput.value = `0x${value
        .toString(16)
        .toUpperCase()
        .padStart(2, "0")}`;
}