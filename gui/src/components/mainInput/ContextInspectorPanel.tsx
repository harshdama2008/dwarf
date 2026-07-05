import { XMarkIcon } from "@heroicons/react/24/outline";
import { ContextItemWithId } from "core";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "react-redux";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectDefaultContextProviders,
  selectUseActiveFile,
} from "../../redux/selectors";
import { excludeContextItemKey } from "../../redux/slices/uiSlice";
import { RootState } from "../../redux/store";
import { getContextItemDisplayInfo } from "../../util/contextItemDisplay";
import { getContextItemKey } from "../../util/contextItemKey";
import {
  CONTEXT_TOKEN_WARNING_THRESHOLD,
  trimContextItemsToTokenBudget,
} from "../../util/contextTokenBudget";
import { estimateTokenCount } from "../../util/estimateTokens";
import ToggleDiv from "../ToggleDiv";
import { useDebouncedEffect } from "../find/useDebounce";
import { useMainEditor } from "./TipTapEditor";
import { processEditorContent } from "./TipTapEditor/utils/processEditorContent";
import { gatherContextItems } from "./TipTapEditor/utils/resolveEditorContent";

// No push event exists for "active file changed" (see ideMessenger protocol),
// so poll at a low frequency to keep the preview in sync with file switches.
const ACTIVE_FILE_POLL_MS = 2000;

export function ContextInspectorPanel() {
  const dispatch = useAppDispatch();
  const ideMessenger = useContext(IdeMessengerContext);
  const reduxStore = useStore<RootState>();
  const { mainEditor } = useMainEditor();

  const useActiveFile = useAppSelector(selectUseActiveFile);
  const defaultContextProviders = useAppSelector(selectDefaultContextProviders);
  const mode = useAppSelector((state) => state.session.mode);
  const excludedKeys = useAppSelector(
    (state) => state.ui.excludedContextItemKeys,
  );

  const [items, setItems] = useState<ContextItemWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!mainEditor) {
      return;
    }
    const bump = () => setRefreshTick((t) => t + 1);
    mainEditor.on("update", bump);
    return () => {
      mainEditor.off("update", bump);
    };
  }, [mainEditor]);

  useEffect(() => {
    const interval = setInterval(
      () => setRefreshTick((t) => t + 1),
      ACTIVE_FILE_POLL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  useDebouncedEffect(
    () => {
      if (!mainEditor) {
        return;
      }
      const requestId = ++requestIdRef.current;
      const { contextRequests, parts, selectedCode } = processEditorContent(
        mainEditor.getJSON(),
      );

      setIsLoading(true);
      gatherContextItems({
        contextRequests,
        modifiers: { useCodebase: false, noContext: !useActiveFile },
        ideMessenger,
        defaultContextProviders,
        parts,
        selectedCode,
        getState: () => reduxStore.getState(),
      })
        .then((resolved) => {
          if (requestId === requestIdRef.current) {
            setItems(resolved);
          }
        })
        .catch(() => {
          if (requestId === requestIdRef.current) {
            setItems([]);
          }
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        });
    },
    300,
    [refreshTick, useActiveFile, mode, defaultContextProviders],
  );

  const visibleItems = useMemo(
    () =>
      items
        .filter((item) => !item.hidden)
        .map((item) => ({ item, key: getContextItemKey(item) }))
        .filter(({ key }) => !excludedKeys.includes(key)),
    [items, excludedKeys],
  );

  const totalTokens = useMemo(
    () =>
      visibleItems.reduce(
        (sum, { item }) => sum + estimateTokenCount(item.content),
        0,
      ),
    [visibleItems],
  );

  const trimmedCount = useMemo(
    () =>
      trimContextItemsToTokenBudget(visibleItems.map(({ item }) => item))
        .trimmedCount,
    [visibleItems],
  );

  if (visibleItems.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="mb-1 px-2" data-testid="context-inspector-panel">
      {trimmedCount > 0 ? (
        <div
          data-testid="context-inspector-over-limit-warning"
          className="text-warning mb-1 px-2 text-xs"
        >
          Context is over the 8,000 token limit - {trimmedCount} item
          {trimmedCount === 1 ? "" : "s"} will be excluded automatically before
          sending. Remove some context to control what's kept.
        </div>
      ) : (
        totalTokens > CONTEXT_TOKEN_WARNING_THRESHOLD && (
          <div
            data-testid="context-inspector-token-warning"
            className="text-warning mb-1 px-2 text-xs"
          >
            Context is using ~{totalTokens} tokens - consider removing some
            items to keep responses fast and affordable.
          </div>
        )
      )}
      <ToggleDiv
        testId="context-inspector-toggle"
        title={
          isLoading && visibleItems.length === 0
            ? "Gathering context…"
            : `Context: ~${totalTokens} tokens (${visibleItems.length} item${
                visibleItems.length === 1 ? "" : "s"
              })`
        }
      >
        {visibleItems.map(({ item, key }) => {
          const { fileName, lines } = getContextItemDisplayInfo(item);
          return (
            <div
              key={key}
              data-testid="context-inspector-item"
              className="text-description flex items-center justify-between gap-2 py-0.5 pr-1 text-xs"
            >
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span className="truncate">{fileName}</span>
                {lines && (
                  <span className="text-description-muted flex-shrink-0">
                    {lines}
                  </span>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <span className="text-description-muted">
                  ~{estimateTokenCount(item.content)} tok
                </span>
                <button
                  type="button"
                  data-testid="context-inspector-item-remove"
                  aria-label={`Remove ${fileName} from context`}
                  onClick={() => dispatch(excludeContextItemKey(key))}
                  className="text-description-muted hover:text-foreground"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </ToggleDiv>
    </div>
  );
}
