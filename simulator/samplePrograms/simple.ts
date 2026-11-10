export const simple =
`// Puts 0-7 into respective registers

ADI r1, #1  // r1 <= [r7 = 0] + 1
ADI r2, #2  // r2 <= [r7 = 0] + 2
ADI r3, #3  // r3 <= [r7 = 0] + 3

ADI r7, #2  // r7 <= 2
LSL r7, #1  // r7 <= 2 << 1 = 4

ADI r4, #0  // r4 <= [r7 = 4] + 0
ADI r5, #1  // r5 <= [r7 = 4] + 1
ADI r6, #2  // r6 <= [r7 = 4] + 2
ADI r7, #3  // r7 <= [r7 = 4] + 3
`;