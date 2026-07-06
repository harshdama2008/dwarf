import { workspace } from "vscode";

export const DWARF_WORKSPACE_KEY = "dwarf";

export function getDwarfWorkspaceConfig() {
  return workspace.getConfiguration(DWARF_WORKSPACE_KEY);
}
