import { describe, it, expect } from "vitest";
import { create_core, execute_instruction, start_core } from "../cpu";
import type { Instruction } from "../types";

describe("I-type Instructions", () => {
    describe("adi", () => {
        it("should write immediate into r7 if operand is 0", () => {
            const core = create_core();
            start_core(core);
            core.registers[7] = 0;

            const inst: Instruction = {
                opcode: "adi",
                operands: [0],
                immediate: 10,
                sourceLine: 0
            };

            execute_instruction(core, inst);
            expect(core.registers[7]).toBe(10);
        });

        it("should write r7 + immediate into register operand if operand is not 0", () => {
            const core = create_core();
            start_core(core);
            core.registers[7] = 20;
            core.registers[4] = 0;

            const inst: Instruction = {
                opcode: "adi",
                operands: [4],
                immediate: 5,
                sourceLine: 0
            };

            execute_instruction(core, inst);
            expect(core.registers[4]).toBe(25);
        });

        it("should handle overflow and set carry_out", () => {
            const core = create_core();
            start_core(core);
            core.registers[7] = 200;
            core.registers[4] = 0;

            const inst: Instruction = {
                opcode: "adi",
                operands: [4],
                immediate: 100,
                sourceLine: 0
            };

            execute_instruction(core, inst);
            expect(core.registers[4]).toBe(44);
            expect(core.carry_out).toBe(true);
        });

        it("should handle negative immediate", () => {
            const core = create_core();
            start_core(core);
            core.registers[7] = 0;
            core.registers[4] = 0;

            const inst: Instruction = {
                opcode: "adi",
                operands: [4],
                immediate: -1,
                sourceLine: 0
            };

            execute_instruction(core, inst);
            expect(core.registers[4]).toBe(255);
        });
    });

    describe("lsl", () => {
        it("should rotate bits by 1 bit, put into reg7", () => {
            const core = create_core();
            start_core(core);
            core.registers[0] = 0x01; // 00000001

            const inst: Instruction = {
                opcode: "lsl",
                operands: [0],
                immediate: 1,
                sourceLine: 0
            };

            expect(core.registers[7]).toBe(0x00);
            execute_instruction(core, inst);
            expect(core.registers[7]).toBe(0x02); // 00000010
        });

        it("should rotate bits 4 bits, put into reg7", () => {
            const core = create_core();
            start_core(core);
            core.registers[0] = 0x80; // 10000000

            const inst: Instruction = {
                opcode: "lsl",
                operands: [0],
                immediate: 4,
                sourceLine: 0
            };

            expect(core.registers[7]).toBe(0x00);
            execute_instruction(core, inst);
            expect(core.registers[7]).toBe(0x08); // 0000_1000
        });

        it("should rotate bits in place for 8 bits (no change)", () => {
            const core = create_core();
            start_core(core);
            core.registers[0] = 0x42;

            const inst: Instruction = {
                opcode: "lsl",
                operands: [0],
                immediate: 8,
                sourceLine: 0
            };

            execute_instruction(core, inst);
            expect(core.registers[0]).toBe(0x42);
        });

        it("should rotate bits in place for 0 bits (no change)", () => {
            const core = create_core();
            start_core(core);
            core.registers[0] = 0x42;

            const inst: Instruction = {
                opcode: "lsl",
                operands: [0],
                immediate: 0,
                sourceLine: 0
            };

            execute_instruction(core, inst);
            expect(core.registers[0]).toBe(0x42);
        });
    });
});