class Editor extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        this.setAttribute("role", "banner");

        this.innerHTML = `
<main class="app-space">
    <div class="editor-title-section">
    <button type="button" class="editor-title-toggle" aria-expanded="false">
        <span class="editor-title">Custom ISA Simulator</span>
        <span class="editor-title-arrow" aria-hidden="true">▼</span>
    </button>
    <div id="globalParam">
        <span>GLOBAL INSTRUCTIONS EXECUTED</span>
        <span id="globalNumber">---</span>
    </div>
    </div>
    <div class="editor-collapse-section">
    <p class="tech">
        TypeScript · Vite · Monaco Editor 
        · Vitest · AWS Lambda · Amazon DynamoDB
        · GitHub Pages
    </p>
    <p>
        An interactive assembly simulator build around a 
        custom RISC instruction set (designed by me),
        allowing users to write, assemble, and execute
        programs in a browser-based environment.
        <br>
        The simulator provides a step-by-step 
        execution interface with visiblitiy
        into processor registers, memory, and instruction
        execution statistics, making it possible to
        inspect program behavior at instruction level.
        <br>
        Developed using TypeScript and Monaco Editor,
        the project combines an assembly parsing
        execution engine with interactive development 
        interface.
        <br>
        It also incorporates a serverless AWS backend
        to collect instruction exectuion statistics,
        deployed via GitHub Pages.
    </p> 
    <div class="project-links">
        Project Links:
        <ul>
        <li><a href="https://github.com/KristopherManalo/KristopherManalo.github.io">
            Simulator Repo
        </a></li>
        <li><a href="/CPU_TechnicalWriteUp.pdf">
            CPU Technical Write Up
        </a></li>
        <li><a href="https://github.com/KristopherManalo/Custom_RISC_CPU">
            Custom CPU Repo
        </a></li>
        </ul>
    </div>
    </ul>
    </div>
    <div class="editor-frame">
    <div class="editor-header">          
        <button title="Runs program to completion" 
        id="assemble" class="editor-button" >
        Assemble*</button>
        <button title="Step-through" id="step-through" class="editor-button" >
        ↓</button>
        <button title="Reset" id="reset" class="editor-button" disabled>
        ↻</button>
        <button title="Cancel" id="cancel" class="editor-button" 
        style="font-size: 1.3rem;" disabled>
        ✕</button>
        <div id="status">
        
        </div>
        <div class="program">
        <label for="program-select" class="program-label">Program</label>
        <select id="program-select" class="program-select">
            <optgroup label="Examples">
            <option value="simple">Simple</option>
            <option value="16to16">Fixed to Float</option>
            </optgroup>

            <optgroup label="Files">
            <option value="new">New Program</option>
            <option value="import">Import assembly .fga</option>
            <option value="export">Export assembly .fga</option>
            </optgroup>
        </select>
        <input
            id="program-import"
            type="file"
            accept=".fga,.asm,.txt"
            hidden
        />
        </div>
    </div>
    <div id="editor"></div>
    </div>
    <div 
    style= "padding-top: 4px;
            padding-left: 6px;"
    class="memory-menu-title"
    >
    Registers</div>
    <div class="editor-footer">
    <div class="registers">
        <ul id="register-select" class="register-select">
        <li value="0x00">R0: 0x00</li>
        <li value="0x00">R1: 0x00</li>
        <li value="0x00">R2: 0x00</li>
        <li value="0x00">R3: 0x00</li>
        <li value="0x00">R4: 0x00</li>
        <li value="0x00">R5: 0x00</li>
        <li value="0x00">R6: 0x00</li>
        <!-- <li value="0x00" class="selected">R7: 0x00</li> -->
        <li value="0x00">R7: 0x00</li>
        </ul>
    </div>
    </div>
    <div class="memory-menu">
        <button
        id="memory-menu-toggle"
        class="memory-menu-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="memory-menu-panel"
        >
        Memory Map
        <span class="menu-arrow"></span>
        </button>
        <div
        class="memory-menu-panel"
        id="memory-menu-panel"
        role="region"
        aria-label="Core memory map"
        hidden
        >
        <div class="memory-menu-toolbar">
            <span class="memory-menu-title">
            Core Memory — 256 bytes
            </span>
            <span title="hex: 0xhh | decimal: ddd | binary: 0bnnnnnnnn or nnnn nnnn"
            class="memory-menu-hint">
            <!-- Click to edit · hex / decimal / binary (b… / 0b… or with spaces) · Enter or click away to save -->
                Click to edit · hex | decimal | binary · Enter or click away to save
            </span>
        </div>
        <div class="memory-grid" id="memory-grid"></div>
        </div>
    </div>
    <p style="color: #a0a0a0; font-size: 9.1px;">
    *Assemble is a misnomer, the amount of pre-processing and code generation
    makes it more akin to a compiler then an assembler**
    </p>
    <p style="color: #a0a0a0; font-size: 7.6px;">
    **Once labels are ported
    </p>
</main>
    `;

    const { initializeMemoryMenu } =
        await import("/scripts/memory-menu.js")
    initializeMemoryMenu(this);
    await import("/simulator/main.ts")
    }
}

customElements.define("editor-whole", Editor);