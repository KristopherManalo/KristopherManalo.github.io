
import * as monaco from "monaco-editor";

export const LANGUAGE_ID = "freaky-gojo-asm";

monaco.languages.register({
    id: LANGUAGE_ID,
});

monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, {
    ignoreCase: true,

    keywords: [
        "ADD",
        "AND",
        "LSL",
        "XOR",
        "LWD",
        "SWD",
        "BEQ",
        "BLT",
        "JMP",
        "ADI",
        "BCO",
        "NOP",
        "DON",
    ],

    tokenizer: {
        root: [
            // Comments
            [/\/\/.*$/, "comment"],

            // Labels (e.g. .NORMALIZE)
            [/^\s*\.[\w]+/, "type.identifier"],

            // Instructions
            [/[a-zA-Z]+/, {
                cases: {
                    "@keywords": "keyword",
                    "@default": "identifier",
                },
            }],

            // Registers (r0-r7)
            [/r[0-7]\b/i, "variable"],

            // Immediate values (e.g. #5, #-10)
            [/#-?\d+/, "number"],

            // Decimal numbers
            [/-?\d+/, "number"],

            // Punctuation
            [/[,:]/, "delimiter"],
        ],
    },
});
