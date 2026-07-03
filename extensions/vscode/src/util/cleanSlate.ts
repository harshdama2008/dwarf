import fs from "fs";

import { getMangoGlobalPath } from "core/util/paths";
import { ExtensionContext } from "vscode";

/**
 * Clear all Mango-related artifacts to simulate a brand new user
 */
export function cleanSlate(context: ExtensionContext) {
  // Commented just to be safe
  // // Remove ~/.mango
  // const mangoPath = getMangoGlobalPath();
  // if (fs.existsSync(mangoPath)) {
  //   fs.rmSync(mangoPath, { recursive: true, force: true });
  // }
  // // Clear extension's globalState
  // context.globalState.keys().forEach((key) => {
  //   context.globalState.update(key, undefined);
  // });
}
