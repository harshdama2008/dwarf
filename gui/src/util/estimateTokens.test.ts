import { estimateTokenCount } from "./estimateTokens";

describe("estimateTokenCount", () => {
  it("returns 0 for empty/undefined/null input", () => {
    expect(estimateTokenCount("")).toBe(0);
    expect(estimateTokenCount(undefined)).toBe(0);
    expect(estimateTokenCount(null)).toBe(0);
  });

  it("estimates roughly chars/4, rounded up", () => {
    expect(estimateTokenCount("a".repeat(8))).toBe(2);
    expect(estimateTokenCount("a".repeat(9))).toBe(3);
  });

  it("never returns 0 for non-empty text", () => {
    expect(estimateTokenCount("a")).toBe(1);
  });
});
