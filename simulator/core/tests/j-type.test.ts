import { describe, it, expect } from "vitest";
import { create_core, execute_instruction, start_core } from "../cpu";
import type { Instruction } from "../types";

describe("J-type Instructions", () => {
    describe("JMP Instruction", () => {
        it("sets pc to 16 * immediate", () => {
            const core = create_core();
            core.pc = 0;

            const instruction: Instruction = {
                opcode: "jmp", operands: [], immediate: 10, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(160);
        });

        it("handles zero immediate", () => {
            const core = create_core();
            core.pc = 100;

            const instruction: Instruction = {
                opcode: "jmp", operands: [], immediate: 0, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(0);
        });

        it("handles large immediate", () => {
            const core = create_core();
            core.pc = 0;

            const instruction: Instruction = {
                opcode: "jmp", operands: [], immediate: 100, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(1600);
        });
    });
});