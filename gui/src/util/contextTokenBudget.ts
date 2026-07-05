import { ContextItemWithId } from "core";
import { estimateTokenCount } from "./estimateTokens";

/** Default cap on total context-item tokens per message, kept well under
 * most models' full context window - conservative by default, to keep token
 * usage predictable. Users can still add more context manually via @
 * mentions; excess is trimmed automatically rather than silently growing. */
export const DEFAULT_MAX_CONTEXT_TOKENS = 8000;

/** Soft threshold: below the hard cap, but high enough to warn the user and
 * suggest trimming before they hit the actual limit. */
export const CONTEXT_TOKEN_WARNING_THRESHOLD = 5000;

/**
 * Keeps context items (in resolution order) until the running token total
 * would exceed maxTokens, dropping the rest. Items are resolved in a fixed
 * order - the active file first, then explicit @mentions in the order
 * typed, then bulk/automatic providers like @codebase last (see
 * gatherContextItems) - so trimming from the end keeps the
 * highest-priority items and drops the least.
 */
export function trimContextItemsToTokenBudget(
  items: ContextItemWithId[],
  maxTokens: number = DEFAULT_MAX_CONTEXT_TOKENS,
): { kept: ContextItemWithId[]; trimmedCount: number } {
  let total = 0;
  let cutoff = items.length;
  for (let i = 0; i < items.length; i++) {
    total += estimateTokenCount(items[i].content);
    if (total > maxTokens) {
      cutoff = i;
      break;
    }
  }
  return { kept: items.slice(0, cutoff), trimmedCount: items.length - cutoff };
}
