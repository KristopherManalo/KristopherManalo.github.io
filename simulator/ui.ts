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