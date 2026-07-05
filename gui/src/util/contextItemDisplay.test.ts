import { ContextItemWithId } from "core";
import { getContextItemDisplayInfo } from "./contextItemDisplay";

function item(overrides: Partial<ContextItemWithId> = {}): ContextItemWithId {
  return {
    content: "some content",
    name: "foo.ts",
    description: "src/foo.ts",
    id: { providerTitle: "file", itemId: "id" },
    ...overrides,
  };
}

describe("getContextItemDisplayInfo", () => {
  it("parses a ranged name into fileName + lines", () => {
    const result = getContextItemDisplayInfo(item({ name: "foo.ts (12-34)" }));
    expect(result).toEqual({ fileName: "foo.ts", lines: "Lines 12-34" });
  });

  it("labels a whole-file item with no range suffix", () => {
    const result = getContextItemDisplayInfo(
      item({ name: "foo.ts", uri: { type: "file", value: "file:///foo.ts" } }),
    );
    expect(result).toEqual({ fileName: "foo.ts", lines: "Whole file" });
  });

  it("leaves lines blank for non-file items with no range", () => {
    const result = getContextItemDisplayInfo(
      item({ name: "Search results", uri: undefined }),
    );
    expect(result).toEqual({ fileName: "Search results", lines: "" });
  });
});
