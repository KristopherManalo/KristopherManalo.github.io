// type Registers
//     <N extends Number, R extends unknown[] = []> 
// =R["length"] extends N ? R : Registers<N, [CpuRegister, ...R]>;

export interface CpuState {
    pc: number;
    // registers: Registers<8>;
    registers: Uint8Array;
    memory: number[];
    halted: boolean;
    carry_out: boolean;
}

// export interface CpuRegister {
//     value: Uint8Array;
// };

export interface Instruction {
    opcode: string;
    operands: number[];
    sourceLine: number;
    immediate: number | null;
}

export function isInstruction(t: any): t is Instruction {
    return t 
        && typeof t.opcode === "string"
        && Array.isArray(t.operands)
        && typeof t.sourceLine === "number"
        && (typeof t.immediate === "number" || t.immediate === null);
}

export interface Label {
    name: string;
    pc: number;
}

export interface ParseContext {
    sourceLine: number;
    pc: number;
    has_label: number;
    goto_label: number;
    labels: Label[];
    current_label: Label | null;
}

export interface ParseError {
    sourceLine: number;
    message: string;
}

export function isParseError(t: any): t is ParseError {
    return t
        && typeof t.sourceLine === "number"
        && typeof t.message === "string"
}

export interface ParseResult {
    instructions: Instruction[];
    errors: ParseError[];
}

export const S_TYPE = new Set(["nop", "don"]);
export const R_TYPE = new Set(["and", "add", "xor"]);
export const B_TYPE = new Set(["beq", "blt", "bco"]);
export const J_TYPE = new Set(["jmp"]);
export const I2_TYPE = new Set(["lsl"]);
export const I3_TYPE = new Set(["adi"]);
export const M_TYPE = new Set(["lwd", "swd"]);


export enum InstructionType {
    S,
    R,
    B,
    J,
    I2,
    I3,
    M
}

export const OPCODE_GROUPS = [
    { type: InstructionType.S, opcodes: S_TYPE },
    { type: InstructionType.R, opcodes: R_TYPE },
    { type: InstructionType.B, opcodes: B_TYPE },
    { type: InstructionType.J, opcodes: J_TYPE },
    { type: InstructionType.I2, opcodes: I2_TYPE },
    { type: InstructionType.I3, opcodes: I3_TYPE },
    { type: InstructionType.M, opcodes: M_TYPE },
];