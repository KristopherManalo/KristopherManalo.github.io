import { Instruction, InstructionType, ParseContext, OPCODE_GROUPS } from "./types";

export async function parse(source: string): Promise<Instruction[]> {
    let instructions: Instruction[] = [];

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
            if(inst) {
                instructions.push(inst);
            }
        }
        catch (error) {
            // throw Error("huh???");
        }
        context.sourceLine++;
    }
    return instructions;
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
): Instruction | null {
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

    const opcode = line.substring(0,3);
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
                var inst: Instruction = {
                    opcode: "/0", 
                    sourceLine: context.sourceLine,
                    operands: [],
                    immediate: null
                };
                throw Error("invalid instruction");
                // should be unreachable
        }
    }
    catch (error) {
        console.log("error:", line)
        throw Error(`Invalid instruction at ${context.sourceLine}`);
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

    if (matches.length != 2) throw Error("Expected two registers");

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
        throw Error("Invalid reg offset");
    }
    return {
        opcode: line.substring(0, 3),
        operands: [reg0, reg1],
        sourceLine: sourceLine,
        immediate: null
    };
}

function encode_b(line: string, sourceLine: number): Instruction {
    line = line.toLowerCase();
    var reg: number | null = null;
    var offset: number | null = null;
    var label: string | null = null;
    try {
        [reg, offset] = get_regimm(line);
    }
    catch (error) {
        [reg, label] = get_reglab(line);
    }
    if (label) {
        throw Error("Label's not yet ported")
    }
    else {
        switch(offset) {
            case -5:
            case 5:
            case 20:
            case -20:
            case 10:
            case -10:
            case 12:
            case 50:
                break;
            case 0:
                throw Error("branch to self");
            default:
                throw Error("not yet ported");
        }
    }
    return {
        opcode: line.substring(0,3),
        operands: [reg],
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