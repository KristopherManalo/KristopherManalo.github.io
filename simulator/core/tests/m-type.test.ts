import { describe, it, expect } from "vitest";
import { create_core, execute_instruction, start_core } from "../cpu";
import type { Instruction } from "../types";

describe("M-type Instructions", () => {
    describe("lwd", () => {
        it("should load a word from memory into a register", () => {
            const core = create_core();
            start_core(core);

            // Setup: memory[5] = 0xAA
            core.memory[5] = 0xAA;
            // reg1 = 5
            core.registers[1] = 5;

            const inst: Instruction = {
                opcode: "lwd",
                operands: [0, 1], // reg0 = dest, reg1 = addr
                immediate: null,
                sourceLine: 0
            };

            execute_instruction(core, inst);

            expect(core.registers[0]).toBe(0xAA);
            expect(core.memory[5]).toBe(0xAA);
            expect(core.pc).toBe(1);
        });
    });

    describe("swd", () => {
        it("should store a word from a register into memory", () => {
            const core = create_core();
            start_core(core);

            // Setup: reg0 = 10 (address), reg1 = 0xBB (value)
            core.registers[0] = 10;
            core.registers[1] = 0xBB;

            const inst: Instruction = {
                opcode: "swd",
                operands: [0, 1], // reg0 = addr, reg1 = src
                immediate: null,
                sourceLine: 0
            };

            execute_instruction(core, inst);

            expect(core.memory[10]).toBe(0xBB);
            expect(core.registers[1]).toBe(0xBB);
            expect(core.pc).toBe(1);
        });
    });
});
