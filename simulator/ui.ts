import { CpuState } from "./core/types";

export function update_registers(core: CpuState): void {
    for (let i = 0; i < core.registers.length; i++) {
        const element = document.getElementById(`reg-${i}`);

        if (element) {
            element.textContent = 
            `0x${core.registers[i].toString(16).toUpperCase().padStart(2, "0")}`;
        }
    }
}