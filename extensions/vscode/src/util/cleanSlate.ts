import fs from "fs";

import { getDwarfGlobalPath } from "core/util/paths";
import { ExtensionContext } from "vscode";

/**
 * Clear all Dwarf-related artifacts to simulate a brand new user
 */
export function cleanSlate(context: ExtensionContext) {
  // Commented just to be safe
  // // Remove ~/.dwarf
  // const dwarfPath = getDwarfGlobalPath();
  // if (fs.existsSync(dwarfPath)) {
  //   fs.rmSync(dwarfPath, { recursive: true, force: true });
  // }
  // // Clear extension's globalState
  // context.globalState.keys().forEach((key) => {
  //   context.globalState.update(key, undefined);
  // });
}
