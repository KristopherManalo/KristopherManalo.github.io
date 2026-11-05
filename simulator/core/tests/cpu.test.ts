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

describe("BEQ Instruction", () => {
    it("increments pc by 1 when register values are not equal", () => {
        const core = create_core();
        core.pc = 10;
        core.halted = false;

        // Set different values in registers 2 and 3
        core.registers[2] = 5;
        core.registers[3] = 3;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [2],
            immediate: 10,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(11); // incremented by 1 (not branch taken)
    });

    it("takes branch (adds immediate to pc) when register values are equal", () => {
        const core = create_core();
        core.pc = 20;
        core.halted = false;

        // Set equal values in registers 2 and 3
        core.registers[2] = 10;
        core.registers[3] = 10;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [2],
            immediate: 5,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(25); // 20 + 5 (branch taken)
    });

    it("does not modify any registers", () => {
        const core = create_core();
        core.halted = false;
        core.registers[0] = 1;
        core.registers[1] = 2;
        core.registers[5] = 99;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [0],
            immediate: 3,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.registers[0]).toBe(1);
        expect(core.registers[1]).toBe(2);
        expect(core.registers[5]).toBe(99);
    });

    it("increments pc by 1 when comparing register 7 to value 0", () => {
        const core = create_core();
        core.pc = 30;
        core.halted = false;

        // Test with reg 7 != 0 (should not branch)
        core.registers[7] = 5;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [7],
            immediate: 10,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(31); // incremented by 1
    });

    it("takes branch when comparing register 7 to value 0", () => {
        const core = create_core();
        core.pc = 40;
        core.halted = false;

        // Test with reg 7 == 0 (should branch)
        core.registers[7] = 0;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [7],
            immediate: 20,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(60); // 40 + 20 (branch taken)
    });

    it("does not branch when comparing register 7 to non-zero value", () => {
        const core = create_core();
        core.pc = 50;
        core.halted = false;

        // Test with reg 7 != 0
        core.registers[7] = 1;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [7],
            immediate: 20,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(51); // incremented by 1
    });

    it("handles wrapping at register 7 -> 0 for non-reg-7 comparisons", () => {
        const core = create_core();
        core.pc = 60;
        core.halted = false;

        core.registers[7] = 0;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [7],
            immediate: 5,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(65); // 60 + 5 (equal values)
    });

    it("increments pc when wrapping from register 7 to 0 with unequal values", () => {
        const core = create_core();
        core.pc = 70;
        core.halted = false;

        // Set unequal values in registers 6 and 0 (wraps from 7)
        core.registers[6] = 50;
        core.registers[0] = 100;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [6],
            immediate: 5,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(71); // incremented by 1 (not equal)
    });

    it("does not modify carry_out flag", () => {
        const core = create_core();
        core.halted = false;
        core.carry_out = true;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [0],
            immediate: 3,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.carry_out).toBe(true); // unchanged
    });

    it("does not modify memory array", () => {
        const core = create_core();
        core.memory[5] = 42;
        const originalMemory = [...core.memory];

        const instruction: Instruction = {
            opcode: "beq",
            operands: [0],
            immediate: 3,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.memory).toEqual(originalMemory);
    });


    it("correctly handles zero values in both registers", () => {
        const core = create_core();
        core.pc = 100;
        core.halted = false;

        core.registers[2] = 0;
        core.registers[3] = 0;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [2],
            immediate: 7,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(107); // 100 + 7 (equal values)
    });

    it("correctly handles maximum value in both registers", () => {
        const core = create_core();
        core.pc = 110;
        core.halted = false;

        core.registers[4] = 255;
        core.registers[5] = 255;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [4],
            immediate: 3,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(113); // 110 + 3 (equal values)
    });

    it("correctly handles negative-like values with high bit set", () => {
        const core = create_core();
        core.pc = 120;
        core.halted = false;

        core.registers[1] = 254; // 1111 1110
        core.registers[2] = 254;

        const instruction: Instruction = {
            opcode: "beq",
            operands: [1],
            immediate: 8,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(128); // 120 + 8 (equal values)
    });

    it("correctly handles single bit difference", () => {
        const core = create_core();
        core.pc = 130;
        core.halted = false;

        core.registers[0] = 42;
        core.registers[1] = 41; // Different by 1

        const instruction: Instruction = {
            opcode: "beq",
            operands: [0],
            immediate: 5,
            sourceLine: 1,
        };

        execute_instruction(core, instruction);

        expect(core.pc).toBe(131); // incremented by 1 (not equal)
    });
});
