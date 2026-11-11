
import * as monaco from "monaco-editor";
import { inherits } from "node:util";

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

            // Registers (r0-r7)
            [/r[0-7]\b/i, "register"],

            // Instructions
            [/[a-zA-Z]+/, {
                cases: {
                    "@keywords": "keyword",
                    "@default": "identifier",
                },
            }],

            // [/r/, "variable"],

            // Immediate values (e.g. #5, #-10)
            [/#-?\d+/, "number"],

            // // Decimal numbers
            // [/-?\d+/, "number"],

            // // Punctuation
            // [/[,:]/, "delimiter"],

            // Macros
            [/^#?[\w]+\s+(0x[0-9a-fA-F]{2}|\d)\s+(0x[0-9a-fA-F]{2}|\d)$/, "annotation"],
        ],
    },
});

monaco.editor.defineTheme("FGAtheme", {
    base: "vs-dark",
    inherit: true,
    rules: [
        { token: 'register', foreground: 'FFA500' }, 
        { token: 'number', foreground: 'B5CEA8'  },
    ],
    colors: {
        "editor.background": "#1E1E1E"
    }
});
