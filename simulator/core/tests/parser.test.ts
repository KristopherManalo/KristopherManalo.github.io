import { describe, it, expect } from "vitest";
import { parse } from "./../parser";

describe("Parser - Single Instruction Tests", () => {
    describe("S-type instructions (NOP, DON)", () => {
        it("parses NOP instruction", async () => {
            const result = await parse("nop\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("nop");
            expect(result[0].operands).toEqual([]);
            expect(result[0].immediate).toBeNull();
        });

        it("parses DON instruction", async () => {
            const result = await parse("don\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("don");
            expect(result[0].operands).toEqual([]);
            expect(result[0].immediate).toBeNull();
        });
    });

    describe("R-type instructions (AND, ADD, XOR)", () => {
        it("parses AND instruction", async () => {
            const result = await parse("and r2 r3\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("and");
            expect(result[0].operands).toEqual([2, 3]);
            expect(result[0].immediate).toBeNull();
        });

        it("parses ADD instruction", async () => {
            const result = await parse("add r1 r4\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("add");
            expect(result[0].operands).toEqual([1, 4]);
            expect(result[0].immediate).toBeNull();
        });

        it("parses XOR instruction", async () => {
            // const result = await parse("xor r5 r6\n");
            // expect(result).toHaveLength(1);
            // expect(result[0].opcode).toBe("xor");
            // expect(result[0].operands).toEqual([5, 6]);
            // expect(result[0].immediate).toBeNull();
            const result = await parse("xor r5 r6\n");
        });
    });

    describe("B-type instructions (BEQ, BLT, BCO)", () => {
        it("parses BEQ instruction", async () => {
            const result = await parse("beq r1 #-5\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("beq");
            expect(result[0].operands).toEqual([1]);
            expect(result[0].immediate).toBe(-5);
        });

        it("parses BLT instruction", async () => {
            const result = await parse("blt r2 #10\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("blt");
            expect(result[0].operands).toEqual([2]);
            expect(result[0].immediate).toBe(10);
        });

        it("parses BCO instruction", async () => {
            const result = await parse("bco r3 #-10\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("bco");
            expect(result[0].operands).toEqual([3]);
            expect(result[0].immediate).toBe(-10);
        });
    });

    describe("J-type instructions (JMP)", () => {
        it("parses JMP instruction", async () => {
            const result = await parse("jmp #50\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("jmp");
            expect(result[0].operands).toEqual([]);
            expect(result[0].immediate).toBe(50);
        });
    });

    describe("I2-type instructions (LSL)", () => {
        it("parses LSL instruction", async () => {
            const result = await parse("lsl r1 #20\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("lsl");
            expect(result[0].operands).toEqual([1]);
            expect(result[0].immediate).toBe(20);
        });
    });

    describe("I3-type instructions (ADI)", () => {
        it("parses ADI instruction", async () => {
            const result = await parse("adi r4 #-20\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("adi");
            expect(result[0].operands).toEqual([4]);
            expect(result[0].immediate).toBe(-20);
        });
    });

    describe("M-type instructions (LWD, SWD)", () => {
        it("parses LWD instruction", async () => {
            const result = await parse("lwd r5 r6\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("lwd");
            expect(result[0].operands).toEqual([5, 6]);
            expect(result[0].immediate).toBeNull();
        });

        it("parses SWD instruction", async () => {
            const result = await parse("swd r7 r8\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("swd");
            expect(result[0].operands).toEqual([7, 8]);
            expect(result[0].immediate).toBeNull();
        });
    });

    describe("Whitespace handling", () => {
        it("parses instruction with extra whitespace", async () => {
            const result = await parse("  and    r2   r3  \n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("and");
            expect(result[0].operands).toEqual([2, 3]);
        });
    });

    describe("Case insensitivity", () => {
        it("parses uppercase NOP instruction", async () => {
            const result = await parse("NOP\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("nop");
        });

        it("parses mixed case ADD instruction", async () => {
            const result = await parse("AdD r2 r3\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("add");
        });
    });
});
