import { CpuState, Instruction, } from "./types";

export function create_core(): CpuState {
    var core: CpuState = {
        pc: 0,
        registers: new Uint8Array(8),
        memory: new Array(256).fill(0),
        halted: true,
        carry_out: false,
    };
    return core;
}

export function execute_instruction(
    core: CpuState,
    inst: Instruction
) {

}

/**
 * No op
 * @param core current cpu
 */
function nop(core: CpuState): void {
    core.pc++;
}

/**
 * Marks program as finished running
 * @param core 
 */
function don(core: CpuState): void {
    core.halted = true;
}

/**
 * As per FGA's specficiations,
 * 
 * r7 <= operand0 & operand1
 * @param core current cpu
 * @param inst inst to execute
 */
function and(core: CpuState, inst: Instruction): void {
    core.registers[7] = 
        core.registers[inst.operands[0]]
        & core.registers[inst.operands[1]];
    core.pc++;
}

/**
 * As per FGA's specifications,
 * 
 * r7 <= operand0 + operand1
 * @param core current cpu
 * @param inst inst to execute
 */
function add(core: CpuState, inst: Instruction): void {
    const result: number = 
        core.registers[inst.operands[0]]
        + core.registers[inst.operands[1]];
    core.pc++;
    core.carry_out = result > 0xFF;
    core.registers[7] = result & 0xFF;
}

/**
 * As per FGA's specfications,
 * 
 * r7 <= operand0 ^ operand1
 * @param core current cpu
 * @param inst inst to execute
 */
function xor(core: CpuState, inst: Instruction): void {
    core.registers[7] =
        core.registers[inst.operands[0]]
        ^ core.registers[inst.operands[1]];
    core.pc++;
}

/**
 * As per FGA's specifications,
 * 
 * compares [register] to [register + 1],
 * if equal, goes to bit mapping
 * @param core current cpu
 * @param inst inst to execute
 */
function beq(core: CpuState, inst:Instruction): void {
    const reg = inst.operands[0];

    const condition = reg === 7
        ? core.registers[7] === 0
        : core.registers[reg] === core.registers[reg + 1];

    core.pc += condition ? inst.immediate! : 1;
}

/**
 * As per FGA's specfications,
 * 
 * compares [register] to [register + 1],
 * if [register] < [register + 1], goes to bit mapping
 * @param core current cpu
 * @param inst isnt to execute
 */
function blt(core: CpuState, inst:Instruction): void {
    const reg = inst.operands[0];

    const condition = reg === 7
        ? core.registers[7] < 0
        : core.registers[reg] < core.registers[reg + 1];

    core.pc += condition ? inst.immediate! : 1;
}

/**
 * If carry out flag is high, take offset
 * @param core current cpu
 * @param inst inst to execute
 */
function bco(core: CpuState, inst:Instruction): void {
    core.pc += core.carry_out ? inst.immediate! : 1;
}