import * as monaco from "monaco-editor";
import EditorWorker from
    "monaco-editor/editor/editor.worker?worker";

import { parse } from "./core/parser"
import { LANGUAGE_ID } from "./language";
import { program_16to16 } from "./samplePrograms/16to16";
import { Instruction } from "./core/types";
import { create_core, execute_instruction } from "./core/cpu";
import { simple } from "./samplePrograms/simple";

self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

const container = document.getElementById("editor");

if (!container) {
  throw new Error("Editor container not found");
}

const editor = monaco.editor.create(container, {
  value: simple,
  language: LANGUAGE_ID,
  theme: "vs-dark",
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: "on",
  scrollBeyondLastLine: true,
  wordWrap: "on"
});

console.log("Monaco initialized", editor);

const assembleButton = document.getElementById("assemble");

assembleButton?.addEventListener("click", () => {
  const source = editor.getValue();
  if (import.meta.env.DEV) console.log("Editor text:\n", source);

  load_program(source)
});

async function load_program(source: string) {
  const instructions = await parse(source);

  const core = create_core();
  console.log("Initial:", core);
  core.halted = false;  

  for (const inst of instructions) {
    console.log(`${inst.opcode}, 
operands: ${inst.operands}, 
immediate: ${inst.immediate},
pc: ${inst};
`);  
  }
  while (!core.halted) {
    const inst = instructions[core.pc];
    if (!inst) break;
    execute_instruction(core, inst);
  }

  console.log("Final:", core);
}