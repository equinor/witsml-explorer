import { Icon } from "@equinor/eds-core-react";
import { getTag } from "components/QueryEditorUtils";
import { createRoot } from "react-dom/client";
import styled from "styled-components";

/**
 * Handles the click event for opening a tag in the QueryEditor.
 * Replaces the self-closing tag with an opening and closing tag and moves the cursor between the tags.
 * @param editor The Ace editor instance.
 * @param row The row number of the tag to open.
 */
const onClickOpenTag = (editor: any, row: number) => {
  const session = editor.getSession();
  const lineText = session.getLine(row);
  const tag = getTag(lineText);
  const newText = `${lineText.replace(/(\s*)\/>/, ">")}</${tag ?? ""}>`;
  session.replace(
    { start: { row, column: 0 }, end: { row, column: lineText.length } },
    newText
  );
  editor.execCommand({
    exec: () => {
      editor.selection.moveCursorBy(0, -(tag?.length ?? 0) - 3);
      editor.selection.clearSelection();
    }
  });
};

let updateTimeout: NodeJS.Timeout | null = null;

/**
 * Uses a deferred call to updateWidgets to avoid adding multiple icons to the same line when scrolling fast.
 * @param editor The Ace editor instance.
 * @param renderer The Ace renderer instance.
 */
export const updateLinesWithWidgets = (editor: any, renderer: any) => {
  // updateWidgets sometimes adds multiple widgets to the same line when scrolling fast, so we need to debounce it slightly.
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  updateTimeout = setTimeout(() => {
    updateWidgets(editor, renderer);
    updateTimeout = null;
  }, 10);
};

/**
 * Updates the widgets for opening tag icons in the QueryEditor.
 * Adds a widget container with an opening tag icon to each line that contains a self-closing tag.
 * @param editor The Ace editor instance.
 * @param renderer The Ace renderer instance.
 */
const updateWidgets = (editor: any, renderer: any) => {
  const textLayer = renderer.$textLayer;
  const config = textLayer.config;
  const session = textLayer.session;

  const firstRow = config.firstRow;
  const lastRow = config.lastRow;

  const lineElements = textLayer.element.childNodes;
  let lineElementsIdx = 0;

  let row = firstRow;
  let foldLine = session.getNextFoldLine(row);
  let foldStart = foldLine ? foldLine.start.row : Infinity;

  const useGroups = textLayer.$useLineGroups();

  while (row <= lastRow) {
    if (row > foldStart) {
      row = foldLine.end.row + 1;
      foldLine = textLayer.session.getNextFoldLine(row, foldLine);
      foldStart = foldLine ? foldLine.start.row : Infinity;
    }

    let lineElement = lineElements[lineElementsIdx++];
    if (lineElement) {
      if (useGroups) lineElement = lineElement.lastChild;
      const lineText = session.getLine(row);
      if (lineText.match(/<.*\/>/) && !lineElement.querySelector("svg")) {
        const widget = (
          <StyledEditIcon
            name="edit"
            size={16}
            onClick={(
              (currentRow) => () =>
                onClickOpenTag(editor, currentRow)
            )(row)}
          />
        );

        const widgetContainer = document.createElement("span");
        widgetContainer.className = "widget";
        widgetContainer.style.marginTop = "-2px";
        widgetContainer.style.boxSizing = "border-box";
        widgetContainer.style.display = "inline-block";
        widgetContainer.style.verticalAlign = "middle";
        widgetContainer.style.pointerEvents = "auto";

        createRoot(widgetContainer).render(widget);

        lineElement.appendChild(widgetContainer);
      }
    }
    row++;
  }
};

const StyledEditIcon = styled(Icon)`
  display: inline-block;
  vertical-align: middle;
  transform: scale(0.75);
  cursor: pointer;
  opacity: 0.7;
`;
