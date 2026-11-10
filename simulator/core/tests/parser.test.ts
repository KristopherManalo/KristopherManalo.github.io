import { describe, it, expect } from "vitest";
import { parse } from "../parser";

describe("Parser - Single Instruction Tests", () => {
    describe("S-type instructions (NOP, DON)", () => {
        it("parses NOP instruction", async () => {
            const result = await parse("nop\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("nop");
            expect(result.instructions[0].operands).toEqual([]);
            expect(result.instructions[0].immediate).toBeNull();
        });

        it("parses DON instruction", async () => {
            const result = await parse("don\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("don");
            expect(result.instructions[0].operands).toEqual([]);
            expect(result.instructions[0].immediate).toBeNull();
        });
    });

    describe("R-type instructions (AND, ADD, XOR)", () => {
        it("parses AND instruction", async () => {
            const result = await parse("and r2 r3\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("and");
            expect(result.instructions[0].operands).toEqual([2, 3]);
            expect(result.instructions[0].immediate).toBeNull();
        });

        it("parses ADD instruction", async () => {
            const result = await parse("add r1 r4\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("add");
            expect(result.instructions[0].operands).toEqual([1, 4]);
            expect(result.instructions[0].immediate).toBeNull();
        });

        it("parses XOR instruction", async () => {
            const result = await parse("xor r5 r6\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("xor");
            expect(result.instructions[0].operands).toEqual([5, 6]);
            expect(result.instructions[0].immediate).toBeNull();
        });
    });

    describe("B-type instructions (BEQ, BLT, BCO)", () => {
        it("parses BEQ instruction", async () => {
            const result = await parse("beq r1 #-5\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("beq");
            expect(result.instructions[0].operands).toEqual([1]);
            expect(result.instructions[0].immediate).toBe(-5);
        });

        it("parses BLT instruction", async () => {
            const result = await parse("blt r2 #10\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("blt");
            expect(result.instructions[0].operands).toEqual([2]);
            expect(result.instructions[0].immediate).toBe(10);
        });

        it("parses BCO instruction", async () => {
            const result = await parse("bco #-10\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("bco");
            expect(result.instructions[0].operands).toHaveLength(0);
            expect(result.instructions[0].immediate).toBe(-10);
        });
    });

    describe("J-type instructions (JMP)", () => {
        it("parses JMP instruction", async () => {
            const result = await parse("jmp #50\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("jmp");
            expect(result.instructions[0].operands).toEqual([]);
            expect(result.instructions[0].immediate).toBe(50);
        });
    });

    describe("I2-type instructions (LSL)", () => {
        it("parses LSL instruction", async () => {
            const result = await parse("lsl r1 #20\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("lsl");
            expect(result.instructions[0].operands).toEqual([1]);
            expect(result.instructions[0].immediate).toBe(20);
        });
    });

    describe("I3-type instructions (ADI)", () => {
        it("parses ADI instruction", async () => {
            const result = await parse("adi r4 #-4\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("adi");
            expect(result.instructions[0].operands).toEqual([4]);
            expect(result.instructions[0].immediate).toBe(-4);
        });
    });

    describe("M-type instructions (LWD, SWD)", () => {
        it("parses LWD instruction", async () => {
            const result = await parse("lwd r5 r6\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("lwd");
            expect(result.instructions[0].operands).toEqual([5, 6]);
            expect(result.instructions[0].immediate).toBeNull();
        });

        it("parses SWD instruction", async () => {
            const result = await parse("swd r7 r8\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("swd");
            expect(result.instructions[0].operands).toEqual([7, 8]);
            expect(result.instructions[0].immediate).toBeNull();
        });
    });

    describe("Whitespace handling", () => {
        it("parses instruction with extra whitespace", async () => {
            const result = await parse("  and    r2   r3  \n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("and");
            expect(result.instructions[0].operands).toEqual([2, 3]);
            expect(result.instructions[0].immediate).toBeNull();
        });
    });

    describe("Case insensitivity", () => {
        it("parses uppercase NOP instruction", async () => {
            const result = await parse("NOP\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("nop");
        });

        it("parses mixed case ADD instruction", async () => {
            const result = await parse("AdD r2 r3\n");
            expect(result.instructions).toHaveLength(1);
            expect(result.instructions[0].opcode).toBe("add");
        });
    });
});

describe("Comment", () => {
    it("comments ignored", async () => {
        const result = await parse("// Comment\nadd r2 r3");
        expect(result.instructions).toHaveLength(1);
        expect(result.instructions[0].opcode).toBe("add");
        expect(result.instructions[0].operands).toEqual([2,3]);
    });
});

describe("Invalid lines", () => {
    describe("Nonsense lines", () => {
        it("nonsense first line", async () => {
            const result = await parse(";asde");
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].message).toContain("Invalid line");
        });
        it("nonsense middle line", async() => {
            const result = await parse("add r7, r0\nasdfefas\nadd r3 r4");
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].message).toContain("Invalid line 2:");
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
            bco #-10
            jmp #50
            lsl r1 #20
            adi r4 #-4
            lwd r5 r6
            swd r7 r8
        `;
        const result = await parse(source);

        expect(result.instructions).toHaveLength(13);
        expect(result.instructions[0].opcode).toBe("nop");
        expect(result.instructions[1].opcode).toBe("don");
        expect(result.instructions[2].opcode).toBe("add");
        expect(result.instructions[2].operands).toEqual([1, 2]);
        expect(result.instructions[3].opcode).toBe("and");
        expect(result.instructions[3].operands).toEqual([3, 4]);
        expect(result.instructions[4].opcode).toBe("xor");
        expect(result.instructions[4].operands).toEqual([5, 6]);
        expect(result.instructions[5].opcode).toBe("beq");
        expect(result.instructions[5].operands).toEqual([1]);
        expect(result.instructions[5].immediate).toBe(-5);
        expect(result.instructions[6].opcode).toBe("blt");
        expect(result.instructions[6].operands).toEqual([2]);
        expect(result.instructions[6].immediate).toBe(10);
        expect(result.instructions[7].opcode).toBe("bco");
        expect(result.instructions[7].operands).toHaveLength(0);
        expect(result.instructions[7].immediate).toBe(-10);
        expect(result.instructions[8].opcode).toBe("jmp");
        expect(result.instructions[8].immediate).toBe(50);
        expect(result.instructions[9].opcode).toBe("lsl");
        expect(result.instructions[9].operands).toEqual([1]);
        expect(result.instructions[9].immediate).toBe(20);
        expect(result.instructions[10].opcode).toBe("adi");
        expect(result.instructions[10].operands).toEqual([4]);
        expect(result.instructions[10].immediate).toBe(-4);
        expect(result.instructions[11].opcode).toBe("lwd");
        expect(result.instructions[11].operands).toEqual([5, 6]);
        expect(result.instructions[12].opcode).toBe("swd");
        expect(result.instructions[12].operands).toEqual([7, 8]);
    });
});

describe("Broken instructions", () => {
    describe("R-types", () => {
        it("AND invalid registers", async () => {
            const result = await parse("and r7, r6\n");
            expect(result.errors).toHaveLength(1);
        });
        it("AND not two registers", async() => {
            const result = await parse("and r7, #3\n");
            expect(result.errors).toHaveLength(1);
        });
        it("ADD invalid registers", async () => {
            const result = await parse("add r7, r6\n");
            expect(result.errors).toHaveLength(1);
        });
        it("ADD not two registers", async() => {
            const result = await parse("add r7, #3\n");
            expect(result.errors).toHaveLength(1);
        });
        it("XOR invalid registers", async () => {
            const result = await parse("xor r7, r6\n");
            expect(result.errors).toHaveLength(1);
        });
        it("XOR not two registers", async() => {
            const result = await parse("xor r7, #3\n");
            expect(result.errors).toHaveLength(1);
        });
    });
    describe("B-types", () => {
        it("BEQ branch to self", async () => {
            const result = await parse("beq r1 #0\n");
            expect(result.errors).toHaveLength(1);
        });
        it("BEQ invalid immediate", async () => {
            const result = await parse("beq r1 #1\n");
            expect(result.errors).toHaveLength(1);
        });
        it("BEQ label not yet ported", async () => {
            const result = await parse("beq r1 .label\n");
            expect(result.errors).toHaveLength(1);
        });
    });
    describe("J-types", () => {
        it("JMP missing immediate", async () => {
            const result = await parse("jmp\n");
            expect(result.errors).toHaveLength(1);
        });
    });
    describe("I2-types", () => {
        it("LSL missing register", async () => {
            const result = await parse("lsl #20\n");
            expect(result.errors).toHaveLength(1);
        });
        it("LSL missing immediate", async () => {
            const result = await parse("lsl r1\n");
            expect(result.errors).toHaveLength(1);
        });
    });
    describe("I3-types", () => {
        it("ADI missing register", async () => {
            const result = await parse("adi #20\n");
            expect(result.errors).toHaveLength(1);
        });
        it("ADI missing immediate", async () => {
            const result = await parse("adi r1\n");
            expect(result.errors).toHaveLength(1);
        });
    });
    describe("M-types", () => {
        it("LWD missing second register", async () => {
            const result = await parse("lwd r1\n");
            expect(result.errors).toHaveLength(1);
        });
        it("SWD missing second register", async () => {
            const result = await parse("swd r1\n");
            expect(result.errors).toHaveLength(1);
        });
    });
});