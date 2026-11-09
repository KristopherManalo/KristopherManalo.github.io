import * as monaco from "monaco-editor";
import EditorWorker from
    "monaco-editor/editor/editor.worker?worker";

import { parse } from "./core/parser"
import { LANGUAGE_ID } from "./language";
import { program_16to16 } from "./samplePrograms/16to16";
import { Instruction, ParseResult } from "./core/types";
import { create_core, execute_instruction, start_core } from "./core/cpu";
import { simple } from "./samplePrograms/simple";
import { update_registers } from "./ui";

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
  wordWrap: "on",
  fixedOverflowWidgets: true
});

const core = create_core();
let program: ParseResult;

console.log("Monaco initialized", editor);

const assembleButton = document.getElementById("assemble");

assembleButton?.addEventListener("click", () => {
  const source = editor.getValue();
  if (import.meta.env.DEV) console.log("Editor text:\n", source);

  // load_program(source)
  assemble_program();
});

let lintTimeout: ReturnType<typeof setTimeout>;

editor.onDidChangeModelContent(() => {
  clearTimeout(lintTimeout);

  lintTimeout = setTimeout(() => {
    console.log("program linted :3");
    lint_program();
  }, 900);
});

async function lint_program() {
  const source = editor.getValue();

  try {
    program = await parse(source);
    monaco.editor.setModelMarkers(
      editor.getModel()!,
      "assembler",
      program.errors.map(error => ({
        severity: monaco.MarkerSeverity.Error,
        message: error.message,
        startLineNumber: error.sourceLine,
        endLineNumber: error.sourceLine,
        startColumn: 1,
        endColumn: editor.getModel()!.getLineMaxColumn(error.sourceLine)
      }))
    );
  }
  catch (error) {
    console.log("lint program error", error);
  }
}

async function assemble_program() {
  const source = editor.getValue();

  try {
    program = await parse(source);
    start_core(core);
    console.log(program);

    while (!core.halted) {
      const inst = program.instructions[core.pc];
      if (!inst) break;
      execute_instruction(core, inst);
      update_registers(core);
    }
  }
  catch (error) {
    console.log("assemble program error", error);
  }
}