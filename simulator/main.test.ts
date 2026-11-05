/**
 * File will define end-to-end tests of simulator
 */

import { describe, it, expect } from "vitest";
import { Instruction } from "./core/types";
import { create_core, execute_instruction } from "./core/cpu";