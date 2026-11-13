import { CpuState } from "./core/types";

export class Status {
    statusMessage: HTMLElement | null;

    constructor(id_name: string) {
        this.statusMessage = document.getElementById(id_name);
    }

    setStep(core: CpuState) {
        this.statusMessage!.textContent = `stepping: pc<=${core.pc}`;
        this.statusMessage!.style.color = "#22c65c";
        this.statusMessage!.title = `next pc is ${core.pc}`;
    }

    setSuccess() {
        this.statusMessage!.textContent = "success";
        this.statusMessage!.style.color = "#22c65c";
        this.statusMessage!.title = "program ran succesfully"
    }

    setFailure() {
        this.statusMessage!.textContent = "failure";
        this.statusMessage!.style.color = "#ff5555";
        this.statusMessage!.title = "program contains errors"
    }

    setModified() {
        this.statusMessage!.textContent = "modified";
        this.statusMessage!.style.color = "#e2c044";
        this.statusMessage!.title = "program has been modified since last full execution";
    }

    clear() {
        this.statusMessage!.textContent = "";
        this.statusMessage!.title = "";
    }
}