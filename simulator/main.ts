import * as monaco from "monaco-editor";
import EditorWorker from
//   "../node_modules/monaco-editor/esm/vs/editor/editor.worker?worker";
//   "monaco-editor/esm/vs/editor/editor.worker?worker";
    "monaco-editor/editor/editor.worker?worker";

import "./style.css";

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
    value: [
        ";; temp program",
        ";; MOV r1, r4"
    ].join("\n"),
    language: "plaintext",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: {
        enabled: false
    },
    fontSize: 14,
    lineNumbers: "on",
    scrollBeyondLastLine: true,
});

console.log("Monaco initialized", editor);