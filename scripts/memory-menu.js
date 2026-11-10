// Collapsible core memory menu (UI only — no core mutation wired up yet).
// Memory is a 256-byte address space indexed 0x00..0xFF, matching the core's
// MEMORY_ARRAY_SIZE. Cells render and are inline-editable for now; connecting
// writes back to the core is left for the next step.
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("memory-menu-toggle");
  const panel = document.getElementById("memory-menu-panel");
  const grid = document.getElementById("memory-grid");
  if (!toggle || !panel || !grid) return;

  const MEMORY_SIZE = 256;

  // Put the address + value text into an existing (possibly detached) cell.
  // dataset.value is stored as a base-10 number, so convert to hex for display.
  function setCellText(cell) {
    cell.textContent = "";
    const addrEl = document.createElement("span");
    addrEl.className = "cell-addr";
    addrEl.textContent = "0x" + cell.dataset.addr;
    const valEl = document.createElement("span");
    valEl.className = "cell-val";
    valEl.textContent =
      "0x" + parseInt(cell.dataset.value, 10).toString(16).padStart(2, "0");
    cell.appendChild(addrEl);
    cell.appendChild(valEl);
  }

  // Build the memory grid once.
  for (let addr = 0; addr < MEMORY_SIZE; addr++) {
    const cell = document.createElement("div");
    cell.className = "memory-cell";
    cell.dataset.addr = addr.toString(16).padStart(2, "0");
    cell.dataset.value = "0";
    setCellText(cell);

    cell.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditor(cell, addr);
    });

    grid.appendChild(cell);
  }

  let activeInput = null;
  let activeCell = null;

  // Replace the cell's static value with a text input for editing.
  function openEditor(cell, addr) {
    // Ignore clicks on an already-open editor.
    if (cell.classList.contains("editing")) return;
    cell.classList.add("editing");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "cell-input";
    input.value =
      "0x" + parseInt(cell.dataset.value, 10).toString(16).padStart(2, "0");

    cell.replaceWith(input);
    activeInput = input;
    activeCell = cell;

    input.focus();
    input.select();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEditor();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEditor();
      }
    });
    input.addEventListener("blur", saveEditor);
  }

  // Numeral dispatch — exactly one rule applies, checked in this order:
  //   1. hex     — starts with 0x (e.g. 0x20, 0xFF)      -> base 16
  //   2. binary  — starts with 0b (e.g. 0b1010)          -> base 2
  //   3. binary  — contains a space (4-bit sets) or starts with b
  //               (e.g. 1000 0000, b1010, B1111)        -> base 2
  //   4. decimal — anything else (e.g. 32)              -> base 10
  // A bare run of 0s and 1s with no prefix or space (e.g. 00001111) is decimal
  // (1111), not binary — binary is disambiguated only by a prefix or spaces.
  // Every result is truncated to one byte (0..0xff) before being stored.
  function parseInput(raw) {
    // Strip surrounding/trailing whitespace so spaced binary like "1000 0000"
    // reads as "10000000". Then dispatch on the numeral system the user typed.
    // Binary needs a b/0b prefix OR a space; a bare run of 0s and 1s is treated
    // as decimal to avoid ambiguity.
    const trimmed = (raw || "").trim();
    const noSpaces = trimmed.replace(/\s+/g, "");
    if (!noSpaces) return 0;

    let value;
    if (/^0[xX]/.test(noSpaces)) {
      // Hex: 0x14, 0xFF
      value = parseInt(noSpaces.slice(2), 16);
    } else if (/^0[bB]/.test(noSpaces)) {
      // Binary with a 0b prefix
      value = parseInt(noSpaces.slice(2), 2);
    } else if (/\s/.test(trimmed) || /^[bB]/.test(noSpaces)) {
      // Binary: spaced ("1000 0000") or b-prefixed ("b10000000")
      value = parseInt(noSpaces.replace(/^[bB]/, ""), 2);
    } else {
      // Decimal (e.g. "14", "255")
      value = parseInt(noSpaces, 10);
    }

    return isNaN(value) ? 0 : (value & 0xff);
  }

  // Close the editor, committing the typed value.
  function saveEditor() {
    if (!activeInput) return;
    const input = activeInput;
    const cell = activeCell;
    activeInput = null;
    activeCell = null;

    cell.dataset.value = parseInput(input.value).toString();
    cell.classList.remove("editing");

    // Put the rebuilt cell back where the input currently sits in the DOM.
    input.replaceWith(cell);
    setCellText(cell);
  }

  function cancelEditor() {
    if (!activeInput) return;
    const input = activeInput;
    const cell = activeCell;
    activeInput = null;
    activeCell = null;

    cell.classList.remove("editing");
    input.replaceWith(cell);
    setCellText(cell);
  }

  // Toggle the panel open/closed.
  toggle.addEventListener("click", function () {
    const open = panel.hidden !== true;
    panel.hidden = open;
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Clicking outside the panel and toggle closes it.
  // Captured on the way down (before a cell is swapped for its editor input,
  // which would detach the original target and read as "outside" on bubble).
  document.addEventListener("click", (e) => {
    if (toggle.contains(e.target) || panel.contains(e.target)) return;
    if (!panel.hidden) {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }
  }, true);
});
