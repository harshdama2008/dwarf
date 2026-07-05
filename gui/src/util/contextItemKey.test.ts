import { ContextItemWithId } from "core";
import { getContextItemKey } from "./contextItemKey";

function item(overrides: Partial<ContextItemWithId> = {}): ContextItemWithId {
  return {
    content: "some content",
    name: "foo.ts",
    description: "src/foo.ts",
    id: { providerTitle: "file", itemId: "random-uuid-1" },
    ...overrides,
  };
}

describe("getContextItemKey", () => {
  it("keys file items by uri, ignoring the volatile itemId", () => {
    const a = item({
      id: { providerTitle: "file", itemId: "uuid-a" },
      uri: { type: "file", value: "file:///a.ts" },
    });
    const b = item({
      id: { providerTitle: "file", itemId: "uuid-b" },
      uri: { type: "file", value: "file:///a.ts" },
    });
    expect(getContextItemKey(a)).toBe(getContextItemKey(b));
  });

  it("produces different keys for different uris", () => {
    const a = item({ uri: { type: "file", value: "file:///a.ts" } });
    const b = item({ uri: { type: "file", value: "file:///b.ts" } });
    expect(getContextItemKey(a)).not.toBe(getContextItemKey(b));
  });

  it("falls back to provider+description when there's no uri", () => {
    const a = item({
      id: { providerTitle: "codebase", itemId: "uuid-a" },
      uri: undefined,
      description: "chunk 1",
    });
    const b = item({
      id: { providerTitle: "codebase", itemId: "uuid-b" },
      uri: undefined,
      description: "chunk 1",
    });
    expect(getContextItemKey(a)).toBe(getContextItemKey(b));
  });
});
