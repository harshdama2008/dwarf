import { ContextItemWithId } from "core";
import {
  DEFAULT_MAX_CONTEXT_TOKENS,
  trimContextItemsToTokenBudget,
} from "./contextTokenBudget";

function itemWithTokens(id: string, tokens: number): ContextItemWithId {
  return {
    content: "x".repeat(tokens * 4),
    name: id,
    description: id,
    id: { providerTitle: "file", itemId: id },
  };
}

describe("trimContextItemsToTokenBudget", () => {
  it("keeps everything when under budget", () => {
    const items = [itemWithTokens("a", 100), itemWithTokens("b", 200)];
    const { kept, trimmedCount } = trimContextItemsToTokenBudget(items, 1000);
    expect(kept).toEqual(items);
    expect(trimmedCount).toBe(0);
  });

  it("drops trailing items once the budget is exceeded", () => {
    const items = [
      itemWithTokens("a", 3000),
      itemWithTokens("b", 3000),
      itemWithTokens("c", 3000),
    ];
    const { kept, trimmedCount } = trimContextItemsToTokenBudget(items, 8000);
    expect(kept.map((i) => i.name)).toEqual(["a", "b"]);
    expect(trimmedCount).toBe(1);
  });

  it("uses DEFAULT_MAX_CONTEXT_TOKENS (8000) when no max is passed", () => {
    const items = [itemWithTokens("a", 9000)];
    const { kept, trimmedCount } = trimContextItemsToTokenBudget(items);
    expect(kept).toEqual([]);
    expect(trimmedCount).toBe(1);
    expect(DEFAULT_MAX_CONTEXT_TOKENS).toBe(8000);
  });

  it("keeps an item that exactly meets the budget", () => {
    const items = [itemWithTokens("a", 8000)];
    const { kept, trimmedCount } = trimContextItemsToTokenBudget(items, 8000);
    expect(kept).toEqual(items);
    expect(trimmedCount).toBe(0);
  });
});
