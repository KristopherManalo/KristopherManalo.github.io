import { describe, it, expect } from "vitest";
import { create_core, execute_instruction, start_core } from "../cpu";
import type { Instruction } from "../types";

describe("CPU Core Creation", () => {
    it("creates a core with initial properties", () => {
        const core = create_core();

        expect(core.pc).toBe(0);
        expect(core.halted).toBe(true);
        expect(core.carry_out).toBe(false);
        expect(Array.from(core.registers)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
        expect(core.memory.length).toBe(256);
        expect(Array.from(core.memory.slice(0, 10))).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it("creates registers as a Uint8Array", () => {
        const core = create_core();
        expect(core.registers instanceof Uint8Array).toBe(true);
        expect(core.registers.length).toBe(8);
    });

    it("creates memory as an Array of length 256", () => {
        const core = create_core();
        expect(Array.isArray(core.memory)).toBe(true);
        expect(core.memory.length).toBe(256);
    });
});
