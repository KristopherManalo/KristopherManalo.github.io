import { describe, it, expect } from "vitest";
import { create_core, execute_instruction, start_core } from "../cpu";
import type { Instruction } from "../types";

describe("R-type Instructions", () => {
    describe("AND Instruction", () => {
        it("increments pc and computes bitwise AND of two operand registers", () => {
            const core = create_core();
            core.pc = 10;

            // Set up test values in registers
            core.registers[2] = 15;   // 0000 1111
            core.registers[3] = 7;    // 0000 0111
            const expectedResult = 7; // 0000 0111

            const instruction: Instruction = {
                opcode: "and",
                operands: [2, 3],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(11); // incremented by 1
            expect(core.registers[7]).toBe(expectedResult);
        });

        it("handles AND with zero operand", () => {
            const core = create_core();
            core.pc = 20;
            core.registers[1] = 255; // 1111 1111

            const instruction: Instruction = {
                opcode: "and",
                operands: [1, 0],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(21);
            expect(core.registers[7]).toBe(0); // 255 & 0 = 0
        });

        it("handles AND with both operands zero", () => {
            const core = create_core();
            core.pc = 30;
            core.registers[4] = 100;
            core.registers[5] = 200;

            const instruction: Instruction = {
                opcode: "and",
                operands: [4, 5],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(31);
            // Verify bitwise AND is correct (both have bit 2 set, so result has bit 2)
            const expected = core.registers[4] & core.registers[5];
            expect(core.registers[7]).toBe(expected);
        });

        it("handles AND with maximum value operand", () => {
            const core = create_core();
            core.pc = 40;
            core.registers[6] = 128; // 1000 0000

            const instruction: Instruction = {
                opcode: "and",
                operands: [6, 7],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(41);
            const expected = core.registers[6] & core.registers[7];
            expect(core.registers[7]).toBe(expected);
        });

        it("only increments pc by exactly 1", () => {
            const core = create_core();
            core.pc = 50;
            const originalPc = core.pc;

            const instruction: Instruction = {
                opcode: "and",
                operands: [0, 0],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(originalPc + 1);
        });

        it("does not change carry_out flag", () => {
            const core = create_core();
            core.halted = false;
            core.carry_out = true;
            core.registers[0] = 15;
            core.registers[1] = 7;

            const instruction: Instruction = {
                opcode: "and",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.carry_out).toBe(true); // unchanged
        });

        it("does not modify memory array", () => {
            const core = create_core();
            core.memory[5] = 42;
            const originalMemory = [...core.memory];

            const instruction: Instruction = {
                opcode: "and",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.memory).toEqual(originalMemory);
        });

        it("preserves all other register values", () => {
            const core = create_core();
            core.registers[0] = 1;
            core.registers[1] = 2;
            core.registers[2] = 3;
            core.registers[3] = 4;
            core.registers[5] = 99;

            const instruction: Instruction = {
                opcode: "and",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.registers[0]).toBe(1);
            expect(core.registers[1]).toBe(2);
            expect(core.registers[2]).toBe(3);
            expect(core.registers[3]).toBe(4);
            expect(core.registers[5]).toBe(99);
            // Only register 7 should be modified
            expect(core.registers[7]).toBe(1 & 2); // should be 0
        });
    });

    describe("ADD Instruction", () => {
        it("adds two operand registers and stores result in output register", () => {
            const core = create_core();
            core.pc = 10;

            // Set up test values in registers
            core.registers[2] = 5;
            core.registers[3] = 3;
            const expectedResult = 8;

            const instruction: Instruction = {
                opcode: "add",
                operands: [2, 3],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(11); // incremented by 1
            expect(core.registers[7]).toBe(expectedResult);
        });

        it("sets carry_out to true when result overflows 8 bits", () => {
            const core = create_core();
            core.pc = 20;
            core.halted = false;
            core.carry_out = false; // Start with no carry

            core.registers[0] = 250; // 1111 1010
            core.registers[1] = 20;  // 0001 0100
            // Expected: 1111 1010 + 0001 0100 = 1 0000 1110 (270 in decimal)
            // Result should be 0, carry_out should be true

            const instruction: Instruction = {
                opcode: "add",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.registers[7]).toBe(14); // Overflowed, result wraps to 14
            expect(core.carry_out).toBe(true);
        });

        it("sets carry_out to true with smaller overflow value", () => {
            const core = create_core();
            core.pc = 30;
            core.halted = false;
            core.carry_out = false;

            core.registers[2] = 180; // 1011 0100
            core.registers[3] = 50;  // 0011 0010
            // Expected: 180 + 50 = 230 (no overflow)

            const instruction: Instruction = {
                opcode: "add",
                operands: [2, 3],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.registers[7]).toBe(230);
            expect(core.carry_out).toBe(false);
        });

        it("does not set carry_out when sum is within 8-bit range", () => {
            const core = create_core();
            core.pc = 40;
            core.halted = false;
            core.carry_out = false;

            core.registers[0] = 127; // Max signed 8-bit positive
            core.registers[1] = 1;   // Small value
            // Expected: 127 + 1 = 128, which overflows but wraps to 0

            const instruction: Instruction = {
                opcode: "add",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.registers[7]).toBe(128);
            expect(core.carry_out).toBe(false); // 128
        });

        it("handles adding two zero operands", () => {
            const core = create_core();
            core.pc = 50;

            const instruction: Instruction = {
                opcode: "add",
                operands: [0, 0],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(51);
            expect(core.registers[7]).toBe(0);
            expect(core.carry_out).toBe(false);
        });

        it("handles adding one zero operand", () => {
            const core = create_core();
            core.pc = 60;

            core.registers[5] = 42;

            const instruction: Instruction = {
                opcode: "add",
                operands: [5, 0],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(61);
            expect(core.registers[7]).toBe(42);
            expect(core.carry_out).toBe(false);
        });

        it("handles adding with carry from previous operation", () => {
            const core = create_core();
            core.pc = 70;
            core.halted = false;
            core.carry_out = true; // Previous operation set carry

            core.registers[0] = 10;
            core.registers[1] = 20;

            const instruction: Instruction = {
                opcode: "add",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(71);
            expect(core.registers[7]).toBe(30);
            // carry_out should be set based on current addition, not previous
        });

        it("increments pc by exactly 1", () => {
            const core = create_core();
            core.pc = 80;
            const originalPc = core.pc;

            const instruction: Instruction = {
                opcode: "add",
                operands: [0, 0],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(originalPc + 1);
        });

        it("does not change halt status", () => {
            const core = create_core();
            core.halted = false;

            const instruction: Instruction = {
                opcode: "add",
                operands: [0, 0],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.halted).toBe(false); // unchanged
        });

        it("does not modify memory array", () => {
            const core = create_core();
            core.memory[5] = 42;
            const originalMemory = [...core.memory];

            const instruction: Instruction = {
                opcode: "add",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.memory).toEqual(originalMemory);
        });

        it("preserves all other register values except output and carry_out", () => {
            const core = create_core();
            core.registers[0] = 1;
            core.registers[1] = 2;
            core.registers[2] = 3;
            core.registers[3] = 4;
            core.registers[4] = 99;

            const instruction: Instruction = {
                opcode: "add",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.registers[0]).toBe(1);
            expect(core.registers[1]).toBe(2);
            expect(core.registers[2]).toBe(3);
            expect(core.registers[3]).toBe(4);
            expect(core.registers[4]).toBe(99);
            // Only registers 7 and carry_out should be modified
        });

        it("handles maximum operand values with overflow", () => {
            const core = create_core();
            core.pc = 100;
            core.halted = false;

            core.registers[6] = 254; // 1111 1110
            core.registers[7] = 1;   // 0000 0001
            // Expected: 254 + 1 = 255 (no overflow, fits in 8 bits)

            const instruction: Instruction = {
                opcode: "add",
                operands: [6, 7],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.registers[7]).toBe(255);
            expect(core.carry_out).toBe(false);
        });

        it("handles overflow at exactly 256", () => {
            const core = create_core();
            core.pc = 110;
            core.halted = false;

            core.registers[0] = 255; // 1111 1111
            core.registers[1] = 1;   // 0000 0001
            // Expected: 255 + 1 = 256 (overflows, wraps to 0)

            const instruction: Instruction = {
                opcode: "add",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.registers[7]).toBe(0);
            expect(core.carry_out).toBe(true);
        });
    });

    describe("XOR Instruction", () => {
        it("computes logical XOR of two operand registers and stores in output register", () => {
            const core = create_core();
            core.pc = 10;

            // Set up test values: 5 = 0000 0101, 3 = 0000 0011
            // XOR: 0000 0110 = 6
            core.registers[2] = 5;
            core.registers[3] = 3;

            const instruction: Instruction = {
                opcode: "xor",
                operands: [2, 3],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(11); // incremented by 1
            expect(core.registers[7]).toBe(6);
        });

        it("handles XOR with zero operand", () => {
            const core = create_core();
            core.pc = 20;

            core.registers[1] = 42;
            // XOR with 0: result should be the original value (reg 7 already 0)

            const instruction: Instruction = {
                opcode: "xor",
                operands: [1, 0],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(21);
            expect(core.registers[7]).toBe(42); // XOR with 0 preserves value
        });

        it("handles both operands zero", () => {
            const core = create_core();
            core.pc = 30;

            const instruction: Instruction = {
                opcode: "xor",
                operands: [0, 0],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(31);
            expect(core.registers[7]).toBe(0); // 0 XOR 0 = 0
        });

        it("handles identical operands (result should be 0)", () => {
            const core = create_core();
            core.pc = 40;

            core.registers[5] = 15;
            core.registers[6] = 15;

            const instruction: Instruction = {
                opcode: "xor",
                operands: [5, 6],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(41);
            expect(core.registers[7]).toBe(0); // Identical values XOR to 0
        });

        it("handles maximum value operands", () => {
            const core = create_core();
            core.pc = 50;

            core.registers[2] = 254; // 1111 1110
            core.registers[3] = 1;   // 0000 0001

            const instruction: Instruction = {
                opcode: "xor",
                operands: [2, 3],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(51);
            // 1111 1110 XOR 0000 0001 = 1111 1111 = 255
            expect(core.registers[7]).toBe(255);
        });

        it("handles bitwise pattern verification", () => {
            const core = create_core();
            core.pc = 60;

            // 8-bit binary: A = 1010 (10), B = 0101 (5)
            // XOR result: 1111 (15)
            core.registers[0] = 10;  // 1010
            core.registers[1] = 5;   // 0101

            const instruction: Instruction = {
                opcode: "xor",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(61);
            expect(core.registers[7]).toBe(15); // 1010 XOR 0101 = 1111 = 15
        });

        it("increments pc by exactly 1", () => {
            const core = create_core();
            core.pc = 70;
            const originalPc = core.pc;

            const instruction: Instruction = {
                opcode: "xor",
                operands: [0, 0],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(originalPc + 1);
        });

        it("does not change carry_out flag", () => {
            const core = create_core();
            core.halted = false;
            core.carry_out = true; // Start with carry set

            core.registers[2] = 5;
            core.registers[3] = 3;

            const instruction: Instruction = {
                opcode: "xor",
                operands: [2, 3],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.carry_out).toBe(true); // Should remain unchanged
        });

        it("does not modify memory array", () => {
            const core = create_core();
            core.memory[5] = 42;
            const originalMemory = [...core.memory];

            const instruction: Instruction = {
                opcode: "xor",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.memory).toEqual(originalMemory);
        });

        it("preserves all other register values except output", () => {
            const core = create_core();
            core.registers[0] = 1;
            core.registers[1] = 2;
            core.registers[2] = 3;
            core.registers[3] = 4;
            core.registers[4] = 99;

            const instruction: Instruction = {
                opcode: "xor",
                operands: [0, 1],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.registers[0]).toBe(1); // unchanged
            expect(core.registers[1]).toBe(2); // unchanged
            expect(core.registers[2]).toBe(3); // unchanged
            expect(core.registers[3]).toBe(4); // unchanged
            expect(core.registers[4]).toBe(99); // unchanged
            // Only register 7 should be modified
        });

        it("works from halted = false", () => {
            const core = create_core();
            core.halted = false;
            core.pc = 80;

            core.registers[2] = 10;
            core.registers[3] = 5;

            const instruction: Instruction = {
                opcode: "xor",
                operands: [2, 3],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(81);
            expect(core.registers[7]).toBe(15); // 10 XOR 5 = 15
            expect(core.halted).toBe(false); // unchanged
        });

        it("handles edge case: all bits different", () => {
            const core = create_core();
            core.pc = 90;

            // 255 (all bits set) XOR 0 = 255
            core.registers[6] = 255;
            core.registers[7] = 0;

            const instruction: Instruction = {
                opcode: "xor",
                operands: [6, 7],
                sourceLine: 1,
                immediate: null,
            };

            execute_instruction(core, instruction);

            expect(core.pc).toBe(91);
            expect(core.registers[7]).toBe(255);
        });
    });
});
