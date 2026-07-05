import { act, waitFor } from "@testing-library/react";
import {
  addAndSelectMockLlm,
  triggerConfigUpdate,
} from "../../../util/test/config";
import { renderWithProviders } from "../../../util/test/render";
import { getMainEditor } from "../../../util/test/utils";
import { Chat } from "../Chat";

describe("Active file included by default", () => {
  it("auto-inserts a removable current-file mention at the start of a new session", async () => {
    const { ideMessenger, store } = await renderWithProviders(<Chat />);
    addAndSelectMockLlm(store, ideMessenger);

    triggerConfigUpdate({
      store,
      ideMessenger,
      editConfig(current) {
        current.contextProviders = [
          {
            title: "currentFile",
            displayTitle: "Current File",
            description: "The current file",
            type: "normal",
          },
        ];
        return current;
      },
    });

    const editor = await getMainEditor();

    await act(async () => {
      ideMessenger.mockMessageToWebview("newSession", undefined);
    });

    await waitFor(() => {
      const json = editor.getJSON();
      const mentionIds = (json.content ?? [])
        .flatMap((block) => block.content ?? [])
        .filter((node) => node.type === "mention")
        .map((node) => node.attrs?.id);
      expect(mentionIds).toContain("currentFile");
    });
  });

  it("does not auto-insert a current-file mention when useCurrentFileAsContext is explicitly disabled", async () => {
    const { ideMessenger, store } = await renderWithProviders(<Chat />);
    addAndSelectMockLlm(store, ideMessenger);

    triggerConfigUpdate({
      store,
      ideMessenger,
      editConfig(current) {
        current.contextProviders = [
          {
            title: "currentFile",
            displayTitle: "Current File",
            description: "The current file",
            type: "normal",
          },
        ];
        current.experimental = {
          ...current.experimental,
          useCurrentFileAsContext: false,
        };
        return current;
      },
    });

    const editor = await getMainEditor();

    await act(async () => {
      ideMessenger.mockMessageToWebview("newSession", undefined);
    });

    // Give the (skipped) auto-insert a chance to fire before asserting absence.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const json = editor.getJSON();
    const mentionIds = (json.content ?? [])
      .flatMap((block) => block.content ?? [])
      .filter((node) => node.type === "mention")
      .map((node) => node.attrs?.id);
    expect(mentionIds).not.toContain("currentFile");
  });
});
