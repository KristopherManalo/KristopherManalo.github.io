export const program_16to16 = 
`// Converts 16-bit fixed point to 16-bit IEEE standard
// Written in assembly for Freaky Gojo CPU
//
// IMPORTANT: ALL R-TYPE INSTRUCTIONS STORE OUTPUT INTO R7
// USE ADI rx, #0 to move r7 into rx
//
// Program has been modified in that labels are
// replaced with immediate literals
// Original label is comment

ADI r2, #1             // r1 = 0, r2 = 1
LWD r1, r1             // LSW
LWD r2, r2             // MSW
ADI r4, #-1
AND r1, r4
ADI r6, #0
AND r2, r4
ADD r6, r7
BEQ r7, #5             // .ZERO, LUT 001 => +5
JMP #1
NOP
NOP
NOP
// .ZERO
JMP #31                // Essentially goes to EOF
NOP
NOP

// .NOTZERO
LSL r2, #1             // r7 = Rolls MSB to LSB
ADI r5, #0             // r5 = r7
ADI r0, #1             // r7 = 1
ADI r6, #0             // r6 = 1
AND r5, r6             // r7 = 0000_000H where H is MSB
ADI r6, #0             // r6 = MSB
LSL r6, #4
LSL r7, #3
ADI r6, #0
ADI r0, #-1
SWD r6, r7             // mem[255] = signed-bit (MSB)
ADI r0, #0
BEQ r6, #20             // .POSITIVE, LUT 010 => +20
ADI r0, #-1             // Upper bit
XOR r7, r2
ADI r2, #0
ADI r0, #-1             // lower bit
XOR r7, r1
ADI r7, #1
BCO #5                 // .AFFECT_HIGH, LUT 001 => +5
ADI r1, #0
JMP #3
NOP
NOP
// NOP
// NOP
// NOP

// .AFFECT_HIGH
ADI r1, #0
ADD r0, r2
ADI r2, #1
JMP #3
NOP
NOP
NOP
NOP
NOP

// .POSITIVE
ADI r0, #0
ADI r4, #-1
ADI r0, #1
LSL r7, #4
LSL r7, #3
ADI r5, #0
NOP
NOP
NOP
NOP
NOP
NOP
NOP
NOP
NOP
NOP
NOP

// .NORMALIZE
// DO NOT USE r4, r5 during normalizing and shifting
// r4 contains shift_amount
// r5 contains 0x80
AND r2, r5
BEQ r7, #5             // .SHIFT, LUT 001 => +5
JMP #6
NOP
NOP
NOP

// .SHIFT
// ((MSW << 1) & 0xfe) + ((LSW << 1) & 0x01)
LSL r2, #1
ADI r2, #0
ADD r0, r2
ADI r6, #0
ADI r0, #-2
AND r6, r7
ADI r6, #0
LSL r1, #1
ADI r1, #0
ADI r0, #1
AND r7, r1
ADD r6, r7
ADI r2, #0
ADI r0, #-2
AND r7, r1
ADI r1, #0
ADD r0, r4
ADI r4, #-1
JMP #4
NOP
NOP
NOP
NOP
NOP
NOP
NOP
NOP

// .EXPONENT
ADI r0, #3
ADI r0, #3
LSL r7, #3
ADI r7, #-1
ADD r4, r7
ADI r4, #0
LSL r4, #2
ADI r4, #0
ADI r0, #-2
SWD r4, r7

// .MANTISSA
LSL r2, #1
ADI r2, #0
ADI r0, #-2
AND r7, r2
ADI r2, #0
LSL r1, #1
ADI r1, #0
ADI r0, #1
AND r7, r1
ADI r6, #0
ADI r0, #-2
AND r7, r1
ADI r1, #0
ADD r6, r2
ADI r2, #0

// .TOP
LSL r2, #2
ADI r2, #0
ADI r0, #0
ADI r6, #-1
ADI r7, #-4
XOR r6, r7
ADI r6, #0
AND r6, r2
ADI r6, #0
ADI r0, #-3
SWD r6, r7

// .LOW
ADI r0, #-4
ADI r6, #0
AND r7, r2
ADI r2, #0
LSL r1, #2
ADI r1, #0
ADI r0, #-1
XOR r6, r7
AND r7, r1
ADD r7, r2
ADI r6, #0
ADI r0, #2
SWD r6, r7

// .HIGH_OUT
ADI r0, #0
ADI r3, #0
ADI r0, #-1
LWD r7, r7
ADI r1, #0
ADD r1, r3
ADI r1, #0
ADI r0, #-2
LWD r7, r7
ADD r7, r1
ADI r1, #0
ADI r0, #-3
LWD r7, r7
ADD r7, r1
ADI r1, #0
ADI r0, #3
SWD r1, r7

DON`
