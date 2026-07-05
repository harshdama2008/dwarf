import { ContextItemWithId } from "core";

const RANGE_SUFFIX_RE = /^(.*?)\s*\((\d+)-(\d+)\)$/;

/**
 * Context items don't have an explicit line-range field - ranged items
 * (code-selection mentions) encode it as a "(start-end)" suffix on `name`
 * (see rifWithContentsToContextItem in core/commands/util.ts). Whole-file
 * items (plain @file mentions, the active file) have no such suffix.
 */
export function getContextItemDisplayInfo(item: ContextItemWithId): {
  fileName: string;
  lines: string;
} {
  const match = item.name.match(RANGE_SUFFIX_RE);
  if (match) {
    return { fileName: match[1], lines: `Lines ${match[2]}-${match[3]}` };
  }
  return {
    fileName: item.name,
    lines: item.uri?.type === "file" ? "Whole file" : "",
  };
}
