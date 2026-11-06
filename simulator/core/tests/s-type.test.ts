import { describe, it, expect } from "vitest";
import { create_core, execute_instruction, start_core } from "../cpu";
import type { Instruction  } from "../types";

describe("S-type Instructions", () => {
    describe("NOP Instruction", () => {
        it("increments pc by 1 and nothing else changes", () => {
            const core = create_core();
            const instruction: Instruction = {
                opcode: "nop",
                operands: [],
                sourceLine: 1,
                immediate: null,
            };
            start_core(core);

            execute_instruction(core, instruction);

            expect(core.pc).toBe(1);
            expect(core.halted).toBe(false);
            expect(core.carry_out).toBe(false);
            expect(Array.from(core.registers)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(core.memory.length).toBe(256);
        });

        it("increments pc from a non-zero value", () => {
            const core = create_core();
            core.pc = 42;
            start_core(core);

            const instruction: Instruction = {
                opcode: "nop",
                operands: [],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(43);
        });

        it("increments pc multiple times consecutively", () => {
            const core = create_core();
            const instruction: Instruction = {
                opcode: "nop",
                operands: [],
                sourceLine: 1,
                immediate: null,
            };
            start_core(core);

            execute_instruction(core, instruction);
            expect(core.pc).toBe(1);

            execute_instruction(core, instruction);
            expect(core.pc).toBe(2);

            execute_instruction(core, instruction);
            expect(core.pc).toBe(3);
        });
    });
    describe("DON Instruction", () => {
        it("marks core as halted", () => {
            const core = create_core();
            core.halted = false; // Start with halted = false

            const instruction: Instruction = {
                opcode: "don",
                operands: [],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.halted).toBe(true);
        });

        it("pc increments by 1", () => {
            const core = create_core();
            core.pc = 42;
            core.halted = false;

            const instruction: Instruction = {
                opcode: "don",
                operands: [],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(43);
        });

        it("does not change other core properties", () => {
            const core = create_core();
            core.halted = false;
            core.carry_out = true;
            core.registers[0] = 100;

            const instruction: Instruction = {
                opcode: "don",
                operands: [],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.halted).toBe(true);
            expect(core.carry_out).toBe(true);
            expect(core.registers[0]).toBe(100);
        });

        it("works from halted = false to halted = true", () => {
            const core = create_core();
            core.halted = false;
            const originalPc = core.pc;
            const originalRegisters = Array.from(core.registers);
            const originalMemory = [...core.memory];

            const instruction: Instruction = {
                opcode: "don",
                operands: [],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.halted).toBe(true);
            expect(core.pc).toBe(originalPc + 1);
            expect(Array.from(core.registers)).toEqual(originalRegisters);
            expect(core.memory).toEqual(originalMemory);
        });
    });
});