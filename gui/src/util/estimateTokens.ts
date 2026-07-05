/**
 * Cheap client-side token estimate (chars/4), used for the context inspector
 * preview. core/llm/countTokens.ts is not safe to import into the gui webview
 * bundle (it eagerly spins up a workerpool at module load), so this
 * intentionally trades precision for being safe to call on every keystroke.
 */
export function estimateTokenCount(text: string | undefined | null): number {
  if (!text) {
    return 0;
  }
  return Math.max(1, Math.ceil(text.length / 4));
}
