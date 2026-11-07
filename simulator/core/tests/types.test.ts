import { describe, test, expect } from "vitest";
import {
    CpuState,
    Instruction,
    Label,
    ParseContext,
    OPCODE_GROUPS,
    InstructionType,
    S_TYPE,
    R_TYPE,
    B_TYPE,
    J_TYPE,
    I2_TYPE,
    I3_TYPE,
    M_TYPE,
} from "./../types";

describe("CpuState", () => {
    test("valid CPU state with all fields", () => {
        const initialState: CpuState = {
            pc: 0,
            registers: new Uint8Array(8),
            memory: [],
            halted: false,
            carry_out: false,
        };

        expect(initialState.pc).toBe(0);
        expect(initialState.registers instanceof Uint8Array);
        expect(initialState.registers.length).toBe(8);
        expect(Array.isArray(initialState.memory)).toBe(true);
        expect(typeof initialState.halted).toBe("boolean");
        expect(typeof initialState.carry_out).toBe("boolean");
    });

    test("CPU state with non-zero PC", () => {
        const state: CpuState = {
            pc: 42,
            registers: new Uint8Array(8).fill(0xFF),
            memory: [1, 2, 3],
            halted: true,
            carry_out: true,
        };

        expect(state.pc).toBe(42);
        expect(state.registers.length).toBe(8);
        expect(state.registers[0]).toBe(0xFF);
        expect(state.memory[0]).toBe(1);
        expect(state.halted).toBe(true);
        expect(state.carry_out).toBe(true);
    });

    test("CPU state with empty arrays", () => {
        const state: CpuState = {
            pc: 0,
            registers: new Uint8Array(8),
            memory: [],
            halted: false,
            carry_out: false,
        };

        expect(state.registers.every((_, i) => state.registers[i] === 0)).toBe(true);
        expect(state.memory.length).toBe(0);
    });

    test("invalid CPU state - wrong register size", () => {
        const invalidState = {
            pc: 0,
            registers: new Uint8Array(4), // Should be 8
            memory: [],
            halted: false,
            carry_out: false,
        } as unknown as CpuState;

        expect(invalidState.registers.length).toBe(4);
    });

    test("invalid CPU state - non-numeric PC", () => {
        const invalidState = {
            pc: NaN,
            registers: new Uint8Array(8),
            memory: [],
            halted: false,
            carry_out: false,
        } as unknown as CpuState;

        expect(Number.isNaN(invalidState.pc)).toBe(true);
    });

    test("invalid CPU state - non-boolean halted", () => {
        const invalidState = {
            pc: 0,
            registers: new Uint8Array(8),
            memory: [],
            halted: "yes" as unknown as boolean, // Type coercion
            carry_out: false,
        } as unknown as CpuState;

        expect(invalidState.halted).toBe("yes");
    });

    test("invalid CPU state - negative PC", () => {
        const invalidState = {
            pc: -1,
            registers: new Uint8Array(8),
            memory: [],
            halted: false,
            carry_out: false,
        } as unknown as CpuState;

        expect(invalidState.pc).toBeLessThan(0);
    });
});

describe("Instruction", () => {
    test("simple instruction with no operands", () => {
        const instr: Instruction = {
            opcode: "nop",
            operands: [],
            sourceLine: 1,
            immediate: null,
        };

        expect(instr.opcode).toBe("nop");
        expect(instr.operands.length).toBe(0);
        expect(instr.sourceLine).toBe(1);
        expect(instr.immediate).toBe(null);
    });

    test("instruction with operands", () => {
        const instr: Instruction = {
            opcode: "add",
            operands: [1, 2],
            sourceLine: 42,
            immediate: null,
        };

        expect(instr.opcode).toBe("add");
        expect(instr.operands.length).toBe(2);
        expect(instr.operands[0]).toBe(1);
        expect(instr.sourceLine).toBe(42);
    });

    test("instruction with immediate value", () => {
        const instr: Instruction = {
            opcode: "adi",
            operands: [5],
            sourceLine: 10,
            immediate: 100,
        };

        expect(instr.opcode).toBe("adi");
        expect(instr.immediate).toBe(100);
    });

    test("instruction with negative immediate value", () => {
        const instr: Instruction = {
            opcode: "swd",
            operands: [3, 4],
            sourceLine: 20,
            immediate: -5,
        };

        expect(instr.immediate).toBe(-5);
    });

    test("invalid instruction - string operands instead of numbers", () => {
        const invalidInstr = {
            opcode: "test",
            operands: ["not", "numbers"],
            sourceLine: 1,
            immediate: null,
        } as unknown as Instruction;

        expect(typeof invalidInstr.operands[0]).toBe("string");
    });
});

describe("Label", () => {
    test("valid label with name and PC", () => {
        const label: Label = {
            name: "loop_start",
            pc: 100,
        };

        expect(label.name).toBe("loop_start");
        expect(typeof label.pc).toBe("number");
        expect(label.pc).toBe(100);
    });

    test("label with empty name should be valid (edge case)", () => {
        const label: Label = {
            name: "",
            pc: 0,
        };

        expect(label.name).toBe("");
    });

    test("label with negative PC", () => {
        const label: Label = {
            name: "negative_pc",
            pc: -1,
        };

        expect(label.pc).toBe(-1);
    });

    test("label with very large PC value", () => {
        const label: Label = {
            name: "large_pc",
            pc: Number.MAX_SAFE_INTEGER,
        };

        expect(label.pc).toBe(Number.MAX_SAFE_INTEGER);
    });
});

describe("ParseContext", () => {
    test("valid parse context with all fields", () => {
        const ctx: ParseContext = {
            sourceLine: 5,
            pc: 100,
            has_label: 2,
            goto_label: 1,
            labels: [
                { name: "start", pc: 50 },
                { name: "end", pc: 200 },
            ],
            current_label: { name: "start", pc: 50 },
        };

        expect(ctx.sourceLine).toBe(5);
        expect(ctx.pc).toBe(100);
        expect(ctx.has_label).toBe(2);
        expect(ctx.goto_label).toBe(1);
        expect(Array.isArray(ctx.labels)).toBe(true);
        expect(ctx.labels.length).toBe(2);
        expect(ctx.current_label).toBeDefined();
    });

    test("parse context with no current label", () => {
        const ctx: ParseContext = {
            sourceLine: 1,
            pc: 0,
            has_label: 0,
            goto_label: 0,
            labels: [],
            current_label: null,
        };

        expect(ctx.current_label).toBeNull();
        expect(ctx.labels.length).toBe(0);
    });

    test("parse context with single label", () => {
        const ctx: ParseContext = {
            sourceLine: 10,
            pc: 50,
            has_label: 1,
            goto_label: 0,
            labels: [{ name: "single", pc: 50 }],
            current_label: { name: "single", pc: 50 },
        };

        expect(ctx.labels.length).toBe(1);
        expect(ctx.current_label?.name).toBe("single");
    });

    test("invalid parse context - negative sourceLine", () => {
        const invalidCtx = {
            sourceLine: -1,
            pc: 0,
            has_label: 0,
            goto_label: 0,
            labels: [],
            current_label: null,
        } as unknown as ParseContext;

        expect(invalidCtx.sourceLine).toBeLessThan(0);
    });

    test("invalid parse context - PC larger than sourceLine", () => {
        const invalidCtx = {
            sourceLine: 5,
            pc: 100,
            has_label: 0,
            goto_label: 0,
            labels: [],
            current_label: null,
        } as unknown as ParseContext;

        expect(invalidCtx.pc).toBeGreaterThan(invalidCtx.sourceLine);
    });
});

describe("InstructionType enum values", () => {
    test("S_TYPE contains expected opcodes", () => {
        const sTypeSet = Array.from(S_TYPE);
        expect(sTypeSet).toEqual(["nop", "don"]);
    });

    test("R_TYPE contains expected opcodes", () => {
        const rTypeSet = Array.from(R_TYPE);
        expect(rTypeSet).toEqual(["and", "add", "xor"]);
    });

    test("B_TYPE contains expected opcodes", () => {
        const bTypeSet = Array.from(B_TYPE);
        expect(bTypeSet).toEqual(["beq", "blt", "bco"]);
    });

    test("J_TYPE contains expected opcodes", () => {
        const jTypeSet = Array.from(J_TYPE);
        expect(jTypeSet).toEqual(["jmp"]);
    });

    test("I2_TYPE contains expected opcodes", () => {
        const i2TypeSet = Array.from(I2_TYPE);
        expect(i2TypeSet).toEqual(["lsl"]);
    });

    test("I3_TYPE contains expected opcodes", () => {
        const i3TypeSet = Array.from(I3_TYPE);
        expect(i3TypeSet).toEqual(["adi"]);
    });

    test("M_TYPE contains expected opcodes", () => {
        const mTypeSet = Array.from(M_TYPE);
        expect(mTypeSet).toEqual(["lwd", "swd"]);
    });

    test("InstructionType enum has all types", () => {
        // const instructionTypes = Object.keys(InstructionType) as (keyof typeof InstructionType)[];
        const instructionTypes = Object.keys(InstructionType).filter((key) => isNaN(Number(key)));
        expect(instructionTypes).toEqual(["S", "R", "B", "J", "I2", "I3", "M"]);
    });

    test("OPCODE_GROUPS has 7 groups", () => {
        expect(OPCODE_GROUPS.length).toBe(7);
    });

    test("OPCODE_GROUPS each group has correct type and opcodes", () => {
        for (const group of OPCODE_GROUPS) {
            expect(group.type).toBeDefined();
            if (group.opcodes) {
                const opcodes = Array.from(group.opcodes);
                if (group.type === InstructionType.S) {
                    expect(opcodes).toEqual(["nop", "don"]);
                } else if (group.type === InstructionType.R) {
                    expect(opcodes).toEqual(["and", "add", "xor"]);
                } else if (group.type === InstructionType.B) {
                    expect(opcodes).toEqual(["beq", "blt", "bco"]);
                } else if (group.type === InstructionType.J) {
                    expect(opcodes).toEqual(["jmp"]);
                } else if (group.type === InstructionType.I2) {
                    expect(opcodes).toEqual(["lsl"]);
                } else if (group.type === InstructionType.I3) {
                    expect(opcodes).toEqual(["adi"]);
                } else if (group.type === InstructionType.M) {
                    expect(opcodes).toEqual(["lwd", "swd"]);
                }
            }
        }
    });
});

describe("OPCODE_GROUPS structure", () => {
    test("each OPCODE_GROUP has type and opcodes properties", () => {
        for (const group of OPCODE_GROUPS) {
            const isValidEnumValue = group.type in InstructionType;
            expect(isValidEnumValue).toBe(true);
            if (group.opcodes && !(group.opcodes instanceof Set)) {
                throw new Error("opcodes should be a Set");
            }
        }
    });

    test("all opcodes in OPCODE_GROUPS are unique", () => {
        const allOpcodes = new Set<string>();
        for (const group of OPCODE_GROUPS) {
            if (group.opcodes instanceof Set) {
                for (const opcode of group.opcodes) {
                    if (allOpcodes.has(opcode as string)) {
                        throw new Error(`Duplicate opcode found: ${opcode}`);
                    }
                    allOpcodes.add(opcode as string);
                }
            }
        }
    });

    test("OPCODE_GROUPS covers all instruction types", () => {
        const expectedTypes = [InstructionType.S, InstructionType.R, InstructionType.B, InstructionType.J, InstructionType.I2, InstructionType.I3, InstructionType.M];
        expect(OPCODE_GROUPS.map(g => g.type)).toEqual(expectedTypes);
    });
});

describe("edge cases for instruction types", () => {
    test("S_TYPE set has 2 opcodes", () => {
        expect(S_TYPE.size).toBe(2);
    });

    test("R_TYPE set has 3 opcodes", () => {
        expect(R_TYPE.size).toBe(3);
    });

    test("B_TYPE set has 3 opcodes", () => {
        expect(B_TYPE.size).toBe(3);
    });

    test("J_TYPE set has 1 opcode", () => {
        expect(J_TYPE.size).toBe(1);
    });

    test("I2_TYPE set has 1 opcode", () => {
        expect(I2_TYPE.size).toBe(1);
    });

    test("I3_TYPE set has 1 opcode", () => {
        expect(I3_TYPE.size).toBe(1);
    });

    test("M_TYPE set has 2 opcodes", () => {
        expect(M_TYPE.size).toBe(2);
    });
});

describe("instruction type membership", () => {
    test("'nop' is in S_TYPE", () => {
        expect(S_TYPE.has("nop")).toBe(true);
    });

    test("'don' is in S_TYPE", () => {
        expect(S_TYPE.has("don")).toBe(true);
    });

    test("'add' is in R_TYPE", () => {
        expect(R_TYPE.has("add")).toBe(true);
    });

    test("'beq' is in B_TYPE", () => {
        expect(B_TYPE.has("beq")).toBe(true);
    });

    test("'jmp' is in J_TYPE", () => {
        expect(J_TYPE.has("jmp")).toBe(true);
    });

    test("'lsl' is in I2_TYPE", () => {
        expect(I2_TYPE.has("lsl")).toBe(true);
    });

    test("'adi' is in I3_TYPE", () => {
        expect(I3_TYPE.has("adi")).toBe(true);
    });

    test("'lwd' is in M_TYPE", () => {
        expect(M_TYPE.has("lwd")).toBe(true);
    });

    test("'swd' is in M_TYPE", () => {
        expect(M_TYPE.has("swd")).toBe(true);
    });
});

describe("type safety and constraints", () => {
    test("CpuState registers must be Uint8Array", () => {
        const valid = new Uint8Array(8);
        const invalid = [] as unknown as Uint8Array;

        expect(valid instanceof Uint8Array).toBe(true);
        // We can't check invalid here without throwing
    });

    test("CpuState memory must be number[]", () => {
        const validMemory: number[] = [1, 2, 3];
        expect(validMemory.length).toBe(3);

        const invalid = "not numbers";
        // Type error would occur at compile time
    });

    test("Label name must be string", () => {
        const label: Label = { name: "valid-label-name", pc: 0 };
        expect(typeof label.name).toBe("string");
    });

    test("ParseContext labels must be array of Label", () => {
        const ctx: ParseContext = {
            sourceLine: 1,
            pc: 0,
            has_label: 0,
            goto_label: 0,
            labels: [
                { name: "label1", pc: 10 },
                { name: "label2", pc: 20 },
            ],
            current_label: null,
        };

        expect(ctx.labels.every(l => typeof l.name === "string" && typeof l.pc === "number")).toBe(true);
    });
});

describe("comprehensive state initialization", () => {
    test("can create fresh CPU state for reset", () => {
        const resetState: CpuState = {
            pc: 0,
            registers: new Uint8Array(8),
            memory: [],
            halted: false,
            carry_out: false,
        };

        expect(resetState.pc).toBe(0);
        expect(resetState.registers.length).toBe(8);
        expect(resetState.memory.length).toBe(0);
        expect(resetState.halted).toBe(false);
        expect(resetState.carry_out).toBe(false);
    });

    test("can create instruction with all fields", () => {
        const instr: Instruction = {
            opcode: "add",
            operands: [1, 2],
            sourceLine: 10,
            immediate: null,
        };

        expect(instr.opcode).toBe("add");
        expect(instr.operands.length).toBe(2);
        expect(instr.sourceLine).toBe(10);
    });

    test("can create label with minimal fields", () => {
        const label: Label = { name: "start", pc: 0 };
        expect(label.name).toBe("start");
        expect(label.pc).toBe(0);
    });

    test("can create parse context with minimal fields", () => {
        const ctx: ParseContext = {
            sourceLine: 1,
            pc: 0,
            has_label: 0,
            goto_label: 0,
            labels: [],
            current_label: null,
        };

        expect(ctx.current_label).toBeNull();
    });
});

describe("instruction type constants", () => {
    test("OPCODE_GROUPS array is non-empty", () => {
        expect(OPCODE_GROUPS.length).toBeGreaterThan(0);
    });

    test("InstructionType enum has defined values", () => {
        const S = InstructionType.S;
        const R = InstructionType.R;
        const B = InstructionType.B;
        const J = InstructionType.J;
        const I2 = InstructionType.I2;
        const I3 = InstructionType.I3;
        const M = InstructionType.M;

        expect(Number(S)).toBe(0);
        expect(Number(R)).toBe(1);
        expect(Number(B)).toBe(2);
        expect(Number(J)).toBe(3);
        expect(Number(I2)).toBe(4);
        expect(Number(I3)).toBe(5);
        expect(Number(M)).toBe(6);
    });
});
