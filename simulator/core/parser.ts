import { 
    Instruction, 
    InstructionType, 
    ParseContext, 
    OPCODE_GROUPS, 
    ParseResult, 
    ParseError,
    isInstruction,
    isParseError
} from "./types";

export async function parse(source: string): Promise<ParseResult> {
    let instructions: Instruction[] = [];
    let errors: ParseError[] = [];

    let context: ParseContext = {
        sourceLine: 1,
        pc: 0,
        has_label: 0, 
        goto_label: 0, 
        labels: [],
        current_label: null
    };

    for await (const line of streamLines(source)) {
        // console.log(context.sourceLine, line);
        try {
            const inst = parse_line(line, context);
            // context.sourceLine++;
            if (inst === null) {
            }
            else if(isInstruction(inst)) {
                instructions.push(inst);
            }
            else if(isParseError(inst)) {
                errors.push(inst);
            }
            else {
                throw Error("Unreachable section reached, check type check functions")
            }
        }
        catch (error) {
            throw new Error(`Invalid line ${context.sourceLine}: ${error}`);
        }
        context.sourceLine++;
    }
    return { 
        instructions: instructions,
        errors: errors
    };
}

export async function* streamLines(source: string)
        : AsyncGenerator<string, void, unknown> {
    let startIndex = 0;

    while (startIndex < source.length) {
        let nextNewlineIndex = source.indexOf('\n', startIndex);

        if (nextNewlineIndex === -1)  {
            yield source.slice(startIndex);
            break
        }

        let endIndex = nextNewlineIndex;
        if (endIndex > startIndex && source[endIndex -1] === "\r") {
            endIndex--;
        }

        yield source.slice(startIndex, endIndex);
        startIndex = nextNewlineIndex + 1;
    }
}

function parse_line(
    line: string, 
    context: ParseContext
): Instruction | ParseError | null {
    // console.log("parsing line");
    line = line.split("//", 1)[0].trim()

    if (line.length === 0) return null;

    // if label push to labels
    if(line[0] == ".") {
        context.has_label = 1;
        context.labels.push({name: line, pc: context.pc});
        context.current_label = {name: line, pc: context.pc};
        return null;
    }

    const opcode = line.trim().split(/\s+/,1)[0].toLowerCase();
    var inst: Instruction;
    // console.log("heya :3 opcode =", opcode, "and its type is", get_type(opcode));
    try {
        switch(get_type(opcode)) {
            case InstructionType.S:
                // NOP and DON, nothing required
                inst = {
                    opcode: opcode.toLowerCase(), 
                    operands: [], 
                    sourceLine: context.sourceLine, 
                    immediate: null
                };
                break;
            case InstructionType.R:
                inst = encode_r(line, context.sourceLine);
                break;
            case InstructionType.B:
                inst = encode_b(line, context.sourceLine);
                break;
            case InstructionType.J:
                inst = encode_j(line, context.sourceLine);
                break;
            case InstructionType.I2:
                inst = encode_i2(line, context.sourceLine);
                break;
            case InstructionType.I3:
                inst = encode_i3(line, context.sourceLine);
                break;
            case InstructionType.M:
                inst = encode_m(line, context.sourceLine);
                break;
            default:
                throw (`Invalid line ${context.sourceLine}`);
        }
    }
    catch (error) {
        // console.log("error:", line)
        const message: string = (`${error}: 
    ${line}`);
        return {
            sourceLine: context.sourceLine,
            message: message
        }
    }

    // if(context.has_label == 1) {

    // }
    return inst;
}

function get_type(opcode: string): InstructionType | undefined {
    const normalized= opcode.trim().toLowerCase();

    return OPCODE_GROUPS.find(
        group => group.opcodes.has(normalized)
    )?.type;
}

/**
 * Checks if reg1 is in range of reg0
 * 
 * reg1 is in range iff reg0 + 4 < reg1, wrapping
 * @param reg0 base reg
 * @param reg1 offset reg
 * @returns 1 if valid, -1 if self, 0 if invalid
 */
function regInRange(reg0: number, reg1: number): number {
    // console.log(reg1, reg0);
    switch(reg1-reg0) {
        case 0:
            return -1;
        case 1:
        case -7:
        case 2:
        case -6:
        case 3:
        case -5:
        case 4:
        case -4:
            return 1;
        default:
            return 0;
    }
}

function get_registers(line: string): number[] {
    const matches = [...line.matchAll(/\br(\d+)\b/g)] ;
    return matches.map(match => Number(match[1]));
}
function get_immediate(line: string): number {
    const match = line.match(/#(-?\d+(?:\.\d+)?)(?![\d.])/);
    if (!match) throw Error("Could not find immediate");
    return Number(match[1]);
}
function get_label(line: string): string {
    const match = line.match(/(?:^|\s)\.([^\s]+)/);
    if (!match) throw Error("Could not find label");
    return match[1];
}

function get_reg(line: string): number {
    const matches = [...line.matchAll(/\br(\d+)\b/g)];
    if (matches.length !== 1) throw Error("Expected one register");
    return Number(matches[0][1]);
}

/**
 * Gets reg0 and reg1 
 * @param line line to parse
 * @returns [reg0, reg1]
 */
function get_regs(line: string): [number, number] {
    const matches = [...line.matchAll(/r(\d+)/g)];

    if (matches.length != 2) throw ("Expected two registers");

    return [Number(matches[0][1]),Number(matches[1][1])];
}

/**
 * From line gets register and immediate
 * @param line 
 * @returns [reg, imm]
 */
function get_regimm(line: string): [number, number] {
    return [get_reg(line), get_immediate(line)];
}

function get_reglab(line: string): [number, string] {
    return [get_reg(line), get_label(line)];
}

function get_imm(line: string): number {
    return get_immediate(line);
}

function encode_r(line: string, sourceLine: number): Instruction {
    line = line.toLowerCase();
    const [reg0, reg1] = get_regs(line);
    // console.log(reg0, reg1);
    if (regInRange(reg0, reg1) != 1) {
        throw ("Invalid reg offset");
    }
    return {
        opcode: line.substring(0, 3),
        operands: [reg0, reg1],
        sourceLine: sourceLine,
        immediate: null
    };
}

const BRANCH_OFFSETS = new Set([-5, 5, 20, -20, 10, -10, 12, 50]);

function encode_b(line: string, sourceLine: number): Instruction {
    line = line.toLowerCase();

    let reg: number | undefined;
    let offset: number | null = null;

    if (line.substring(0, 3) === "bco") {
        offset = get_imm(line);
    } else {
        try {
            [reg, offset] = get_regimm(line);
        } catch (error) {
            const [, label] = get_reglab(line);
            throw Error(`Label '${label}' is not yet ported`);
        }
    }

    if (offset === 0) {
        throw Error("branch to self");
    }
    if (!BRANCH_OFFSETS.has(offset)) {
        throw (`illegal offset: use
    -5, 5, 20, -20, 10, -10, 12, 50`);
    }

    return {
        opcode: line.substring(0, 3),
        operands: reg === undefined ? [] : [reg],
        sourceLine: sourceLine,
        immediate: offset
    };
}

function encode_j(line: string, sourceLine: number): Instruction {
    line = line.toLowerCase();
    const imm = get_imm(line);
    return {
        opcode: line.substring(0,3),
        operands: [],
        sourceLine: sourceLine,
        immediate: imm
    };
}

function encode_i2(line: string, sourceLine: number): Instruction {
    line = line.toLowerCase();
    const [reg, imm] = get_regimm(line);
    return {
        opcode: line.substring(0,3),
        operands: [reg],
        sourceLine: sourceLine,
        immediate: imm
    };
}

function encode_i3(line: string, sourceLine: number): Instruction {
    line = line.toLowerCase();
    const [reg, imm] = get_regimm(line);
    if (imm > 3 || imm < -4) {
        throw ("immediate must be in [-4, 3]");
    }
    return {
        opcode: line.substring(0,3),
        operands: [reg],
        sourceLine: sourceLine,
        immediate: imm
    };
}

function encode_m(line: string, sourceLine: number): Instruction {
    line = line.toLowerCase();
    const [reg0, reg1] = get_regs(line);
    return {
        opcode: line.substring(0,3),
        operands: [reg0, reg1],
        sourceLine: sourceLine,
        immediate: null
    };
}