import * as monaco from "monaco-editor";
import EditorWorker from
    "monaco-editor/editor/editor.worker?worker";

import { parse } from "./core/parser"
import { LANGUAGE_ID } from "./language";
import { program_16to16 } from "./samplePrograms/16to16";
import { Instruction, ParseResult } from "./core/types";
import { apply_directives, create_core, execute_instruction, reset_core, start_core } from "./core/cpu";
import { simple } from "./samplePrograms/simple";
import {
    update_registers_view,
    initialize_memory_view,
    update_memory_cell,
    update_memory_view,
    set_memory_write_callback,
} from "./ui";
import { Status } from "./status"
import { flushInstructionCount } from "./stats";

setInterval(() => {
  flushInstructionCount();
}, 15000);

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

monaco.editor.setTheme("FGAtheme");

const core = create_core();
let program: ParseResult;
initialize_memory_view();

const statusMessage = new Status("status");

if (import.meta.env.DEV) console.log("Monaco initialized", editor);

const assembleButton = 
  document.getElementById("assemble") as HTMLButtonElement | null;
const stepThroughButton = 
  document.getElementById("step-through") as HTMLButtonElement | null;
const resetButton = 
  document.getElementById("reset") as HTMLButtonElement | null;
const cancelButton = 
  document.getElementById("cancel") as HTMLButtonElement | null;


assembleButton?.addEventListener("click", async () => {
  const source = editor.getValue();
  if (import.meta.env.DEV) console.log("Editor text:\n", source);
  try {
    await assemble_program();
    if (program.errors.length !== 0) {
      statusMessage.setFailure();
    }
    else {
      statusMessage.setSuccess();
    }
  }
  catch (error) {
    console.log(error);
    statusMessage.setFailure();
  }
});


stepThroughButton?.addEventListener("click", async () => {
  // console.log("isStep =",isStep);
  if (!isStep) {
    reset_core(core);
    start_core(core);
    const source = editor.getValue();
    program = await parse(source);
    if (program.errors.length !== 0) {
      statusMessage.setFailure();
    }
    else {
      isStep = true;
      statusMessage.setStep(core);
      apply_directives(core, program.directives);
      editor.updateOptions({
        readOnly: true
      });
      update_memory_view(core.memory);
      update_registers_view(core);
      resetButton!.disabled = false;
      cancelButton!.disabled = false;
      stepThroughButton.classList.add("editor-button-highlight");
      stepThroughButton.classList.remove("editor-button");
      if (import.meta.env.DEV) console.log(program);
    }
  }
  else {
    step_through();
  }
});


resetButton?.addEventListener("click", async () => {
  await reset();
});

cancelButton?.addEventListener("click", async () =>{
  await cancel();
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

programSelector?.addEventListener("change", async () => {
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
  reset_core(core);
  isStep = false;
});

set_memory_write_callback((address, value) => {
  core.memory[address] = value;
})

let lintTimeout: ReturnType<typeof setTimeout>;

editor.onDidChangeModelContent(() => {
  clearTimeout(lintTimeout);

  lintTimeout = setTimeout(() => {
    // console.log("program linted :3");
    lint_program();
  }, 900);
  statusMessage.setModified();
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

let executionDecoration: string[] = [];

async function assemble_program() {
  const source = editor.getValue();
  executionDecoration = editor.deltaDecorations(
    executionDecoration,
    []
  );
  isStep = false;

  try {
    program = await parse(source);
    reset_core(core);
    apply_directives(core, program.directives);
    start_core(core);
    if (import.meta.env.DEV) {
      console.log(program);
      console.log(core);
    }

    while (!core.halted) {
      const inst = program.instructions[core.pc];
      if (!inst) {
        core.halted = true;
        break;
      }
      execute_instruction(core, inst);
    }
    update_registers_view(core);
    update_memory_view(core.memory);
    if (import.meta.env.DEV) console.log(core);
    flushInstructionCount();

    editor.updateOptions({
      readOnly: false
    });
    stepThroughButton!.classList.add("editor-button");
    stepThroughButton!.classList.remove("editor-button-highlight");
  }
  catch (error) {
    console.log("assemble program error", error);
  }
}


async function step_through() {
  if (!program.instructions[core.pc]) {
    cancel();
    return;
  }
  if (core.halted) {
    cancel();
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
  editor.setPosition({
    lineNumber: sourceLine,
    column: 1,
  });
  editor.revealLineInCenter(sourceLine);
  update_registers_view(core);
  update_memory_view(core.memory);
  statusMessage.setStep(core);
}

async function reset() {
  executionDecoration = editor.deltaDecorations(
    executionDecoration,
    []
  );
  reset_core(core);
  start_core(core);
  isStep = true;
  const source = editor.getValue();
  program = await parse(source);
  apply_directives(core, program.directives);
}

async function cancel() {
  executionDecoration = editor.deltaDecorations(
    executionDecoration,
    []
  );
  statusMessage.clear();
  isStep = false;
  resetButton!.disabled = true;
  cancelButton!.disabled = true;
  stepThroughButton!.classList.add("editor-button");
  stepThroughButton!.classList.remove("editor-button-highlight");
  editor.updateOptions({
      readOnly: false
  });
  flushInstructionCount();
}

