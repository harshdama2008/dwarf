import { RULE_FILE_EXTENSION, sanitizeRuleName } from "@dwarfdev/config-yaml";
import { joinPathsToUri } from "../../util/uri";

function createRelativeRuleFilePathParts(ruleName: string): string[] {
  const safeRuleName = sanitizeRuleName(ruleName);
  return [".dwarf", "rules", `${safeRuleName}.${RULE_FILE_EXTENSION}`];
}

export function createRelativeRuleFilePath(ruleName: string): string {
  return createRelativeRuleFilePathParts(ruleName).join("/");
}

/**
 * Creates the file path for a rule in the workspace .dwarf/rules directory
 */
export function createRuleFilePath(
  workspaceDir: string,
  ruleName: string,
): string {
  return joinPathsToUri(
    workspaceDir,
    ...createRelativeRuleFilePathParts(ruleName),
  );
}
