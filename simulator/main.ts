import * as monaco from "monaco-editor";
import EditorWorker from
    "monaco-editor/editor/editor.worker?worker";

import { parse } from "./core/parser"
import { LANGUAGE_ID } from "./language";
import { program_16to16 } from "./samplePrograms/16to16";
import { Instruction } from "./core/types";
import { create_core } from "./core/cpu";

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
  value: program_16to16,
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

  // try {
    load_program(source)
  // } catch (error) {
    // console.error("Parsing failed:");
  // }
});

async function load_program(source: string) {
  const instructions = await parse(source);

  const core = create_core();

  for (const inst of instructions) {
    console.log(`${inst.opcode}`);
  }
}