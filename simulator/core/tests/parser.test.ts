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
            const result = await parse("xor r5 r6\n");
            expect(result).toHaveLength(1);
            expect(result[0].opcode).toBe("xor");
            expect(result[0].operands).toEqual([5, 6]);
            expect(result[0].immediate).toBeNull();
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
            expect(result[0].immediate).toBeNull();
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

describe("Comment", () => {
    it("comments ignored", async () => {
        const result = await parse("// Comment\nadd r2 r3");
        expect(result).toHaveLength(1);
        expect(result[0].opcode).toBe("add");
        expect(result[0].operands).toEqual([2,3]);
    });
});

describe("Invalid lines", () => {
    describe("Nonsense lines", () => {
        it("nonsense first line", async () => {
            await expect(parse(";asde")).rejects.toThrow("Invalid line");
        });
        it("nonsense middle line", async() => {
            await expect(parse("add r7, r0\nasdfefas\nadd r3 r4")).rejects.toThrow("Invalid line 2:");
        });
    });
});

describe("Complete Run Through", () => {
    it("parses a sequence of all instruction types", async () => {
        const source = `
            nop
            don
            add r1 r2
            and r3 r4
            xor r5 r6
            beq r1 #-5
            blt r2 #10
            bco r3 #-10
            jmp #50
            lsl r1 #20
            adi r4 #-20
            lwd r5 r6
            swd r7 r8
        `;
        const result = await parse(source);

        expect(result).toHaveLength(13);
        expect(result[0].opcode).toBe("nop");
        expect(result[1].opcode).toBe("don");
        expect(result[2].opcode).toBe("add");
        expect(result[2].operands).toEqual([1, 2]);
        expect(result[3].opcode).toBe("and");
        expect(result[3].operands).toEqual([3, 4]);
        expect(result[4].opcode).toBe("xor");
        expect(result[4].operands).toEqual([5, 6]);
        expect(result[5].opcode).toBe("beq");
        expect(result[5].operands).toEqual([1]);
        expect(result[5].immediate).toBe(-5);
        expect(result[6].opcode).toBe("blt");
        expect(result[6].operands).toEqual([2]);
        expect(result[6].immediate).toBe(10);
        expect(result[7].opcode).toBe("bco");
        expect(result[7].operands).toEqual([3]);
        expect(result[7].immediate).toBe(-10);
        expect(result[8].opcode).toBe("jmp");
        expect(result[8].immediate).toBe(50);
        expect(result[9].opcode).toBe("lsl");
        expect(result[9].operands).toEqual([1]);
        expect(result[9].immediate).toBe(20);
        expect(result[10].opcode).toBe("adi");
        expect(result[10].operands).toEqual([4]);
        expect(result[10].immediate).toBe(-20);
        expect(result[11].opcode).toBe("lwd");
        expect(result[11].operands).toEqual([5, 6]);
        expect(result[12].opcode).toBe("swd");
        expect(result[12].operands).toEqual([7, 8]);
    });
});

describe("Broken instructions", () => {
    describe("R-types", () => {
        it("AND invalid registers", async () => {
            await expect(parse("and r7, r6\n")).rejects.toThrow("Invalid line");
        });
        it("AND not two registers", async() => {
            await expect(parse("and r7, #3\n")).rejects.toThrow("Invalid line");
        });
        it("ADD invalid registers", async () => {
            await expect(parse("add r7, r6\n")).rejects.toThrow("Invalid line");
        });
        it("ADD not two registers", async() => {
            await expect(parse("add r7, #3\n")).rejects.toThrow("Invalid line");
        });
        it("XOR invalid registers", async () => {
            await expect(parse("xor r7, r6\n")).rejects.toThrow("Invalid line");
        });
        it("XOR not two registers", async() => {
            await expect(parse("xor r7, #3\n")).rejects.toThrow("Invalid line");
        });
    });
    describe("B-types", () => {
        it("BEQ branch to self", async () => {
            await expect(parse("beq r1 #0\n")).rejects.toThrow("Invalid line");
        });
        it("BEQ invalid immediate", async () => {
            await expect(parse("beq r1 #1\n")).rejects.toThrow("Invalid line");
        });
        it("BEQ label not yet ported", async () => {
            await expect(parse("beq r1 .label\n")).rejects.toThrow("Invalid line");
        });
    });
    describe("J-types", () => {
        it("JMP missing immediate", async () => {
            await expect(parse("jmp\n")).rejects.toThrow("Invalid line");
        });
    });
    describe("I2-types", () => {
        it("LSL missing register", async () => {
            await expect(parse("lsl #20\n")).rejects.toThrow("Invalid line");
        });
        it("LSL missing immediate", async () => {
            await expect(parse("lsl r1\n")).rejects.toThrow("Invalid line");
        });
    });
    describe("I3-types", () => {
        it("ADI missing register", async () => {
            await expect(parse("adi #20\n")).rejects.toThrow("Invalid line");
        });
        it("ADI missing immediate", async () => {
            await expect(parse("adi r1\n")).rejects.toThrow("Invalid line");
        });
    });
    describe("M-types", () => {
        it("LWD missing second register", async () => {
            await expect(parse("lwd r1\n")).rejects.toThrow("Invalid line");
        });
        it("SWD missing second register", async () => {
            await expect(parse("swd r1\n")).rejects.toThrow("Invalid line");
        });
    });
});