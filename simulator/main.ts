import * as monaco from "monaco-editor";
import EditorWorker from
    "monaco-editor/editor/editor.worker?worker";

import { parse } from "./core/parser"
import { LANGUAGE_ID } from "./language";
import { program_16to16 } from "./samplePrograms/16to16";
import { Instruction, ParseResult } from "./core/types";
import { create_core, execute_instruction, reset_core, start_core } from "./core/cpu";
import { simple } from "./samplePrograms/simple";
import {
    update_registers,
    sync_memory_value,
} from "./ui";

self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

let isStep = false;

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

  assemble_program();
});

const stepThroughButton = document.getElementById("step-through");

stepThroughButton?.addEventListener("click", async () => {
  console.log("isStep =",isStep);
  if (!isStep) {
    reset_core(core);
    start_core(core);
    isStep = true;
    const source = editor.getValue();
    program = await parse(source);
    console.log(program);
  }
  else {
    step_through();
  }
});

const resetButton = document.getElementById("reset");

resetButton?.addEventListener("click", () => {
});

const programSelector = document.getElementById(
  "program-select"
) as HTMLSelectElement;
const importInput = document.getElementById(
  "program-import"
) as HTMLInputElement;
importInput.addEventListener("change", async () => {
  const file = importInput.files?.[0];
  if (!file) return;

  const source = await file.text();
  editor.setValue(source);

  // Reset so the same file can be re-imported and the dropdown returns to
  // its initial state once the file picker closes.
  importInput.value = "";
  programSelector.value = "new";
});

programSelector?.addEventListener("change", () => {
  const selection = programSelector.value;

  switch (selection) {
    case "simple":
      editor.setValue(simple);
      break;
    case "16to16":
      editor.setValue(program_16to16);
      break;
    case "new":
      editor.setValue("");
      break;
    case "import":
      // Trigger the OS file-select dialog on the hidden input.
      importInput?.click();
      break;
    case "export":
      let curr: string = editor.getValue();
      const blob = new Blob([curr], { type: "test/plain"});
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "program.fga";
      anchor.click();
      URL.revokeObjectURL(url);
      break;
  }
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
  isStep = false;

  try {
    program = await parse(source);
    reset_core(core);
    start_core(core);
    console.log(program);

    while (!core.halted) {
      const inst = program.instructions[core.pc];
      if (!inst) {
        core.halted = true;
        break;
      }
      execute_instruction(core, inst);
      update_registers(core);
      sync_memory_value(core);
    }
  }
  catch (error) {
    console.log("assemble program error", error);
  }
}

let executionDecoration: string[] = [];

async function step_through() {
  if (!program.instructions[core.pc]) {
    executionDecoration = editor.deltaDecorations(
      executionDecoration,
      []
    );
    isStep = false;
    return;
  }
  const sourceLine = program.instructions[core.pc].sourceLine;
  execute_instruction(core, program.instructions[core.pc]);
  executionDecoration = editor.deltaDecorations(
    executionDecoration, 
    [{
      range: new monaco.Range(sourceLine, 1, sourceLine, 1),
      options: {
        isWholeLine: true,
        className: "executing-line"
      }
  }]);
  update_registers(core);
}