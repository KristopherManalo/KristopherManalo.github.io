import { describe, it, expect } from "vitest";
import { create_core, execute_instruction } from "../cpu";
import type { Instruction } from "../types";

describe("B-type Instructions", () => {
    describe("BEQ Instruction", () => {
        it("increments pc by 1 when register values are not equal", () => {
            const core = create_core();
            core.pc = 10;
            core.registers[2] = 5;
            core.registers[3] = 3;

            const instruction: Instruction = {
                opcode: "beq", operands: [2], immediate: 10, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(11);
        });

        it("takes branch when register values are equal", () => {
            const core = create_core();
            core.pc = 20;
            core.registers[2] = 10;
            core.registers[3] = 10;

            const instruction: Instruction = {
                opcode: "beq", operands: [2], immediate: 5, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(25);
        });

        it("increments pc by 1 when reg7 != 0 (unsigned comparison)", () => {
            const core = create_core();
            core.pc = 30;
            core.registers[7] = 5;

            const instruction: Instruction = {
                opcode: "beq", operands: [7], immediate: 10, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(31);
        });

        it("takes branch when reg7 == 0 (unsigned comparison)", () => {
            const core = create_core();
            core.pc = 40;
            core.registers[7] = 0;

            const instruction: Instruction = {
                opcode: "beq", operands: [7], immediate: 20, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(60);
        });

        it("does not branch when reg7 != 0 with negative-like value (unsigned)", () => {
            const core = create_core();
            core.pc = 50;
            core.registers[7] = 254; // high bit set

            const instruction: Instruction = {
                opcode: "beq", operands: [7], immediate: 15, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(51);
        });
    });

    describe("BLT Instruction", () => {
        it("increments pc by 1 when register is not less than next", () => {
            const core = create_core();
            core.pc = 10;
            core.registers[2] = 5;
            core.registers[3] = 3;

            const instruction: Instruction = {
                opcode: "blt", operands: [2], immediate: 10, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(11);
        });

        it("takes branch when register is less than next", () => {
            const core = create_core();
            core.pc = 20;
            core.registers[2] = 5;
            core.registers[3] = 10;

            const instruction: Instruction = {
                opcode: "blt", operands: [2], immediate: 7, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(27);
        });

        it("increments pc by 1 when reg7 > any unsigned value (compares to literal 0)", () => {
            const core = create_core();
            core.pc = 30;
            core.registers[7] = 5;

            const instruction: Instruction = {
                opcode: "blt", operands: [7], immediate: 10, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(31);
        });

        it("increments pc by 1 when reg7 == any unsigned value (compares to literal 0)", () => {
            const core = create_core();
            core.pc = 40;
            core.registers[7] = 0;

            const instruction: Instruction = {
                opcode: "blt", operands: [7], immediate: 20, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(41);
        });

        it("increments pc by 1 when reg7 == max unsigned (compares to literal 0)", () => {
            const core = create_core();
            core.pc = 50;
            core.registers[7] = 255;

            const instruction: Instruction = {
                opcode: "blt", operands: [7], immediate: 15, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(51);
        });

        it("handles zero vs non-zero branch correctly", () => {
            const core = create_core();
            core.pc = 60;
            core.registers[2] = 0;
            core.registers[3] = 5;

            const instruction: Instruction = {
                opcode: "blt", operands: [2], immediate: 4, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(64);
        });

        it("handles max value vs smaller (no branch)", () => {
            const core = create_core();
            core.pc = 70;
            core.registers[4] = 255;
            core.registers[5] = 100;

            const instruction: Instruction = {
                opcode: "blt", operands: [4], immediate: 3, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(71);
        });

        it("handles high-bit values correctly (unsigned comparison)", () => {
            const core = create_core();
            core.pc = 80;
            core.registers[1] = 254;
            core.registers[2] = 253;

            const instruction: Instruction = {
                opcode: "blt", operands: [1], immediate: 8, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(81); // 254 is not less than 253
        });

        it("handles adjacent values for branch taken", () => {
            const core = create_core();
            core.pc = 90;
            core.registers[0] = 42;
            core.registers[1] = 43;

            const instruction: Instruction = {
                opcode: "blt", operands: [0], immediate: 5, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(95);
        });

        it("handles adjacent values for no branch", () => {
            const core = create_core();
            core.pc = 100;
            core.registers[2] = 43;
            core.registers[3] = 42;

            const instruction: Instruction = {
                opcode: "blt", operands: [2], immediate: 5, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(101);
        });

        it("handles equal values (no branch - less than requires strict inequality)", () => {
            const core = create_core();
            core.pc = 110;
            core.registers[2] = 50;
            core.registers[3] = 50;

            const instruction: Instruction = {
                opcode: "blt", operands: [2], immediate: 10, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(111);
        });

        it("handles zero in first register (branches if second is non-zero)", () => {
            const core = create_core();
            core.pc = 120;
            core.registers[5] = 0;
            core.registers[6] = 1;

            const instruction: Instruction = {
                opcode: "blt", operands: [5], immediate: 4, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(124);
        });

        it("handles max value in first register (never less than any unsigned)", () => {
            const core = create_core();
            core.pc = 130;
            core.registers[6] = 255;
            core.registers[7] = 0;

            const instruction: Instruction = {
                opcode: "blt", operands: [6], immediate: 4, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(131);
        });

        it("handles negative-like immediate value", () => {
            const core = create_core();
            core.pc = 140;
            core.registers[2] = 5;
            core.registers[3] = 10;

            const instruction: Instruction = {
                opcode: "blt", operands: [2], immediate: -5, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(135); // 140 + (-5) = 135
        });

        it("handles negative immediate with no branch (pc increments by 1, not immediate)", () => {
            const core = create_core();
            core.pc = 150;
            core.registers[2] = 10;
            core.registers[3] = 5;

            const instruction: Instruction = {
                opcode: "blt", operands: [2], immediate: -3, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(151); // no branch taken, so pc += 1
        });

        it("handles negative immediate with branch (pc adds immediate offset)", () => {
            const core = create_core();
            core.pc = 160;
            core.registers[2] = 5;
            core.registers[3] = 10;

            const instruction: Instruction = {
                opcode: "blt", operands: [2], immediate: -4, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(156); // branch taken, pc += (-4) = 156
        });

        it("handles large positive immediate", () => {
            const core = create_core();
            core.pc = 160;
            core.registers[2] = 5;
            core.registers[3] = 10;

            const instruction: Instruction = {
                opcode: "blt", operands: [2], immediate: 50, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(210); // 160 + 50 = 210
        });

        it("does not modify carry_out flag", () => {
            const core = create_core();
            core.carry_out = true;

            const instruction: Instruction = {
                opcode: "blt", operands: [0], immediate: 3, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.carry_out).toBe(true);
        });

        it("does not modify memory array", () => {
            const core = create_core();
            core.memory[5] = 42;
            const originalMemory = [...core.memory];

            const instruction: Instruction = {
                opcode: "blt", operands: [0], immediate: 3, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.memory).toEqual(originalMemory);
        });

        it("does not modify registers", () => {
            const core = create_core();
            core.registers[0] = 1;
            core.registers[1] = 2;
            core.registers[5] = 99;

            const instruction: Instruction = {
                opcode: "blt", operands: [0], immediate: 3, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.registers[0]).toBe(1);
            expect(core.registers[1]).toBe(2);
            expect(core.registers[5]).toBe(99);
        });
    });

    describe("BCO Instruction", () => {
        it("takes branch when carry_out is true", () => {
            const core = create_core();
            core.pc = 100;
            core.carry_out = true;

            const instruction: Instruction = {
                opcode: "bco", operands: [], immediate: 20, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(120);
        });

        it("increments pc by 1 when carry_out is false", () => {
            const core = create_core();
            core.pc = 100;
            core.carry_out = false;

            const instruction: Instruction = {
                opcode: "bco", operands: [], immediate: 20, sourceLine: 1,
            };
            execute_instruction(core, instruction);
            expect(core.pc).toBe(101);
        });

        it("does not modify other core values", () => {
            const core = create_core();
            core.pc = 100;
            core.carry_out = true;
            core.registers[0] = 1;
            core.memory[5] = 42;
            const originalRegisters = new Uint8Array(core.registers);
            const originalMemory = [...core.memory];

            const instruction: Instruction = {
                opcode: "bco", operands: [], immediate: 20, sourceLine: 1,
            };
            execute_instruction(core, instruction);

            expect(core.pc).toBe(120);
            expect(core.carry_out).toBe(true);
            expect(core.registers).toEqual(originalRegisters);
            expect(core.memory).toEqual(originalMemory);
            expect(core.halted).toBe(true);
        });
    });
});
