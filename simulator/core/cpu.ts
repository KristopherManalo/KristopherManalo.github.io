import { incrementInstructionExecution } from "../stats";
import { CpuState, Instruction, InstructionType, ParseMacro, } from "./types";

const REGISTER_ARRAY_SIZE = 8;
const MEMORY_ARRAY_SIZE = 256;

export function create_core(): CpuState {
    var core: CpuState = {
        pc: 0,
        registers: new Uint8Array(REGISTER_ARRAY_SIZE).fill(0),
        memory: new Array(MEMORY_ARRAY_SIZE).fill(0),
        halted: true,
        carry_out: false,
    };
    return core;
}

export function start_core(core: CpuState): void {
    core.halted = false;
}

export function reset_core(core: CpuState): void {
    core.pc = 0;
    for (let i = 0; i < REGISTER_ARRAY_SIZE; ++i) {
        core.registers[i] = 0;
    }
    for (let i = 0; i < MEMORY_ARRAY_SIZE; ++i) {
        core.memory[i] = 0;
    }
    core.halted = true;
    core.carry_out = false;
}

export function apply_directives(
    core: CpuState, 
    directives: ParseMacro[]
): void {
    for(let i = 0; i < directives.length; ++i) {
        core.memory[directives[i].operands[0]] = directives[i].operands[1];
    }
}

type InstructionHandler 
        = (core: CpuState, inst: Instruction) => number;

const INSTRUCTION_HANDLERS: Record<string, InstructionHandler> = {
    nop,
    don,
    and,
    add,
    xor,
    beq,
    blt,
    bco,
    jmp,
    lsl,
    adi,
    lwd,
    swd,
};

export function execute_instruction(
    core: CpuState,
    inst: Instruction
): number {
    // console.log(inst.opcode);
    const handler = INSTRUCTION_HANDLERS[inst.opcode];

    if (!handler) {
        throw Error(`Invalid opcode: ${inst.opcode}`);
    }

    const affected_reg: number = handler(core, inst);

    incrementInstructionExecution();

    return affected_reg;
}

/**
 * No op
 * @param core current cpu
 */
function nop(core: CpuState): number {
    core.pc++;
    return -1;
}

/**
 * Marks program as finished running
 * @param core 
 */
function don(core: CpuState): number {
    core.pc++;
    core.halted = true;
    return -1;
}

/**
 * As per FGA's specficiations,
 * 
 * r7 <= operand0 & operand1
 * @param core current cpu
 * @param inst inst to execute
 */
function and(core: CpuState, inst: Instruction): number {
    core.registers[7] = 
        core.registers[inst.operands[0]]
        & core.registers[inst.operands[1]];
    core.pc++;
    return 7;
}

/**
 * As per FGA's specifications,
 * 
 * r7 <= operand0 + operand1
 * @param core current cpu
 * @param inst inst to execute
 */
function add(core: CpuState, inst: Instruction): number {
    const result: number = 
        core.registers[inst.operands[0]]
        + core.registers[inst.operands[1]];
    core.pc++;
    core.carry_out = result > 0xFF;
    core.registers[7] = result & 0xFF;
    return 7;
}

/**
 * As per FGA's specfications,
 * 
 * r7 <= operand0 ^ operand1
 * @param core current cpu
 * @param inst inst to execute
 */
function xor(core: CpuState, inst: Instruction): number{
    core.registers[7] =
        core.registers[inst.operands[0]]
        ^ core.registers[inst.operands[1]];
    core.pc++;
    return 7;
}

/**
 * As per FGA's specifications,
 * 
 * compares [register] to [register + 1],
 * if equal, goes to bit mapping
 * @param core current cpu
 * @param inst inst to execute
 */
function beq(core: CpuState, inst: Instruction): number {
    const reg = inst.operands[0];

    const condition = reg === 7
        ? core.registers[7] === 0
        : core.registers[reg] === core.registers[reg + 1];

    core.pc += condition ? inst.immediate! : 1;
    return -1;
}

/**
 * As per FGA's specfications,
 * 
 * compares [register] to [register + 1],
 * if [register] < [register + 1], goes to bit mapping
 * @param core current cpu
 * @param inst isnt to execute
 */
function blt(core: CpuState, inst: Instruction): number {
    const reg = inst.operands[0];

    const condition = reg === 7
        ? core.registers[7] < 0
        : core.registers[reg] < core.registers[reg + 1];

    core.pc += condition ? inst.immediate! : 1;
    return -1;
}

/**
 * If carry out flag is high, take offset
 * @param core current cpu
 * @param inst inst to execute
 */
function bco(core: CpuState, inst: Instruction): number{
    core.pc += core.carry_out ? inst.immediate! : 1;
    return -1;
}

function jmp(core: CpuState, inst: Instruction): number {
    core.pc = inst.immediate! * 16;
    return -1;
}

function adi(core: CpuState, inst: Instruction): number {
    const reg = inst.operands[0];
    // ex: mov r0, #3 ;; moves [r7] = 3
    if (reg === 0) {
        core.registers[7] = inst.immediate!;
        core.pc++;
        return 7;
    }
    else {
        const result: number = core.registers[7] + inst.immediate!;
        core.carry_out = result > 0xFF;
        core.registers[reg] = result & 0xFF;
        core.pc++;
        return reg;
    }
}

/**
 * Rotating shifter despite its name being logical
 * @param core 
 * @param inst 
 */
function lsl(core: CpuState, inst: Instruction): number {
    const reg = inst.operands[0];
    const value = core.registers[reg];
    const imm = inst.immediate!;
    core.registers[7] = (value << imm) | (value >> (8 - imm));
    core.pc++;
    return 7;
}

/**
 * No longer present in hardware
 * @param core 
 * @param inst 
 */
function lsr(core: CpuState, inst: Instruction): number {
    return -1;
}

/**
 * Loads word from storage into register
 * 
 * reg0 <= [reg1]
 * @param core 
 * @param inst 
 */
function lwd(core: CpuState, inst: Instruction): number {
    const reg0 = inst.operands[0];
    const reg1 = inst.operands[1];

    // reg0 <= [reg1]
    core.registers[reg0] = core.memory[core.registers[reg1]];
    core.pc++;

    return reg0;
}

/**
 * Stores word into storage from register
 * 
 * reg0 => [reg1]
 * @param core 
 * @param inst 
 */
function swd(core: CpuState, inst: Instruction): number {
    const reg0 = inst.operands[0];
    const reg1 = inst.operands[1];
    core.memory[core.registers[reg1]] = core.registers[reg0];
    core.pc++;
    return -1;
}


