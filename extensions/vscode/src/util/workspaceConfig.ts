import { workspace } from "vscode";

export const MANGO_WORKSPACE_KEY = "mango";

export function getMangoWorkspaceConfig() {
  return workspace.getConfiguration(MANGO_WORKSPACE_KEY);
}
