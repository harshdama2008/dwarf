import { act, screen, waitFor } from "@testing-library/react";
import { addAndSelectMockLlm } from "../../../util/test/config";
import { renderWithProviders } from "../../../util/test/render";
import {
  getElementByTestId,
  getMainEditor,
  sendInputWithMockedResponse,
} from "../../../util/test/utils";
import { Chat } from "../Chat";

const MOCK_FILE_ITEM = {
  id: { providerTitle: "file", itemId: "does-not-matter" },
  name: "a.ts",
  description: "src/a.ts",
  content: "x".repeat(40), // ~10 estimated tokens
  uri: { type: "file" as const, value: "file:///a.ts" },
};

async function attachMentionToMainEditor() {
  const editor = await getMainEditor();
  await act(async () => {
    editor.commands.insertContent([
      {
        type: "mention",
        attrs: {
          id: "file:///a.ts",
          label: "a.ts",
          itemType: "file",
          query: "a.ts",
        },
      },
    ]);
  });
}

function mentionNode(fileLabel: string) {
  return {
    type: "mention",
    attrs: {
      id: `file:///${fileLabel}`,
      label: fileLabel,
      itemType: "file",
      query: fileLabel,
    },
  };
}

describe("Context inspector panel", () => {
  it("stays collapsed by default and shows an estimated token count once context resolves", async () => {
    const { ideMessenger, store } = await renderWithProviders(<Chat />);
    addAndSelectMockLlm(store, ideMessenger);
    ideMessenger.responseHandlers["context/getContextItems"] = async ({
      name,
      query,
    }) => (name === "file" && query === "a.ts" ? [MOCK_FILE_ITEM] : []);

    await attachMentionToMainEditor();

    const panel = await getElementByTestId("context-inspector-panel");
    await waitFor(() => {
      expect(panel.textContent).toMatch(/~10 tokens \(1 item\)/);
    });
  });

  it("expands to show file name, line range, and per-item token count", async () => {
    const { ideMessenger, store } = await renderWithProviders(<Chat />);
    addAndSelectMockLlm(store, ideMessenger);
    ideMessenger.responseHandlers["context/getContextItems"] = async ({
      name,
      query,
    }) => (name === "file" && query === "a.ts" ? [MOCK_FILE_ITEM] : []);

    await attachMentionToMainEditor();

    const toggle = await getElementByTestId("context-inspector-toggle");
    await waitFor(() => {
      expect(toggle.textContent).toMatch(/~10 tokens/);
    });

    await act(async () => {
      toggle.click();
    });

    const row = await getElementByTestId("context-inspector-item");
    expect(row.textContent).toContain("a.ts");
    expect(row.textContent).toContain("Whole file");
    expect(row.textContent).toContain("~10 tok");
  });

  it("removing an item via the X button excludes it from the next request", async () => {
    const { ideMessenger, store } = await renderWithProviders(<Chat />);
    addAndSelectMockLlm(store, ideMessenger);
    ideMessenger.responseHandlers["context/getContextItems"] = async ({
      name,
      query,
    }) => (name === "file" && query === "a.ts" ? [MOCK_FILE_ITEM] : []);

    await attachMentionToMainEditor();

    const toggle = await getElementByTestId("context-inspector-toggle");
    await waitFor(() => {
      expect(toggle.textContent).toMatch(/1 item/);
    });
    await act(async () => {
      toggle.click();
    });

    const removeButton = await getElementByTestId(
      "context-inspector-item-remove",
    );
    await act(async () => {
      removeButton.click();
    });

    // With the only context item excluded, the panel has nothing left to show.
    await waitFor(() => {
      expect(
        screen.queryByTestId("context-inspector-panel"),
      ).not.toBeInTheDocument();
    });

    await sendInputWithMockedResponse(ideMessenger, "hello", [
      { role: "assistant", content: "hi" },
    ]);

    const userHistoryItem = store.getState().session.history.at(-2);
    expect(userHistoryItem?.contextItems ?? []).toHaveLength(0);
  });

  it("shows a soft warning once context exceeds 5000 tokens but stays under the 8000 limit", async () => {
    const { ideMessenger, store } = await renderWithProviders(<Chat />);
    addAndSelectMockLlm(store, ideMessenger);
    const bigItem = {
      id: { providerTitle: "file", itemId: "does-not-matter" },
      name: "big.ts",
      description: "src/big.ts",
      content: "x".repeat(6000 * 4), // ~6000 estimated tokens
      uri: { type: "file" as const, value: "file:///big.ts" },
    };
    ideMessenger.responseHandlers["context/getContextItems"] = async ({
      name,
      query,
    }) => (name === "file" && query === "big.ts" ? [bigItem] : []);

    const editor = await getMainEditor();
    await act(async () => {
      editor.commands.insertContent([mentionNode("big.ts")]);
    });

    const warning = await getElementByTestId("context-inspector-token-warning");
    expect(warning.textContent).toMatch(/~6000 tokens/);
    expect(
      screen.queryByTestId("context-inspector-over-limit-warning"),
    ).not.toBeInTheDocument();
  });

  it("shows an over-limit warning and auto-excludes items beyond the 8000 token limit before sending", async () => {
    const { ideMessenger, store } = await renderWithProviders(<Chat />);
    addAndSelectMockLlm(store, ideMessenger);
    const itemA = {
      id: { providerTitle: "file", itemId: "a" },
      name: "a.ts",
      description: "src/a.ts",
      content: "x".repeat(5000 * 4), // ~5000 estimated tokens
      uri: { type: "file" as const, value: "file:///a.ts" },
    };
    const itemB = {
      id: { providerTitle: "file", itemId: "b" },
      name: "b.ts",
      description: "src/b.ts",
      content: "x".repeat(5000 * 4), // ~5000 estimated tokens
      uri: { type: "file" as const, value: "file:///b.ts" },
    };
    ideMessenger.responseHandlers["context/getContextItems"] = async ({
      name,
      query,
    }) => {
      if (name === "file" && query === "a.ts") return [itemA];
      if (name === "file" && query === "b.ts") return [itemB];
      return [];
    };

    const editor = await getMainEditor();
    await act(async () => {
      editor.commands.insertContent([
        mentionNode("a.ts"),
        { type: "text", text: " " },
        mentionNode("b.ts"),
      ]);
    });

    const warning = await getElementByTestId(
      "context-inspector-over-limit-warning",
    );
    expect(warning.textContent).toMatch(/over the 8,000 token limit/);
    expect(warning.textContent).toMatch(/1 item/);

    await sendInputWithMockedResponse(ideMessenger, "hello", [
      { role: "assistant", content: "hi" },
    ]);

    const userHistoryItem = store.getState().session.history.at(-2);
    const keptNames = (userHistoryItem?.contextItems ?? []).map(
      (item) => item.name,
    );
    expect(keptNames).toEqual(["a.ts"]);
  });
});
