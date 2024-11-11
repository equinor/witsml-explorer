import { Icon, Tooltip } from "@equinor/eds-core-react";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import { getParentTag, getTag } from "components/QueryEditorUtils";
import { isExpandableGroupObject } from "components/Sidebar/ObjectGroupItem";
import EntityType from "models/entityType";
import { ObjectType } from "models/objectType";
import { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { NavigateFunction } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";
import { createLogCurveValuesSearchParams } from "routes/utils/createLogCurveValuesSearchParams";
import {
  getLogCurveValuesViewPath,
  getLogObjectViewPath,
  getObjectGroupsViewPath,
  getObjectsViewPath,
  getObjectViewPath,
  getWellboresViewPath
} from "routes/utils/pathBuilder";
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
export const updateLinesWithWidgets = (
  editor: any,
  renderer: any,
  navigate: NavigateFunction,
  serverUrl: string,
  readonly: boolean
) => {
  // updateWidgets sometimes adds multiple widgets to the same line when scrolling fast, so we need to debounce it slightly.
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  updateTimeout = setTimeout(() => {
    updateWidgets(editor, renderer, navigate, serverUrl, readonly);
    updateTimeout = null;
  }, 10);
};

/**
 * Updates the widgets in the QueryEditor.
 * Current widgets:
 *   Edit widget to open self-closing xml tags.
 *   Navigation widget to navigate to objects given the uids in the result editor.
 * @param editor The Ace editor instance.
 * @param renderer The Ace renderer instance.
 */
const updateWidgets = (
  editor: any,
  renderer: any,
  navigate: NavigateFunction,
  serverUrl: string,
  readonly: boolean
) => {
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

  const fullQuery: string = editor.getValue();

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
      if (
        lineText.match(/<.*\/>/) &&
        !lineElement.querySelector("svg") &&
        !readonly
      ) {
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

        addWidgetToLine(lineElement, widget);
      }

      const uids = [
        ...lineText.matchAll(/\b(uid(?:Well|Wellbore)?|uid)="([^"]+)"/g)
      ].reduce((acc, match) => {
        acc[match[1]] = match[2];
        return acc;
      }, {});
      if (
        Object.keys(uids).length &&
        !lineElement.querySelector("svg") &&
        readonly
      ) {
        const { pathname, searchParams } = getNavigationPath(
          lineText,
          row,
          fullQuery,
          serverUrl,
          uids
        );
        if (pathname) {
          const widget = (
            <Tooltip title={`Open ${getTag(lineText)} in table view`}>
              <StyledEditIcon
                name="goTo"
                size={18}
                onClick={() =>
                  navigate({
                    pathname,
                    search: searchParams?.toString()
                  })
                }
              />
            </Tooltip>
          );

          addWidgetToLine(lineElement, widget);
        }
      }
    }
    row++;
  }
};

/**
 * Extracts the navigation path and search parameters for the given line of text.
 * @param lineText The text of the line to navigate from.
 * @param row The row number of the line.
 * @param fullQuery The entire query text.
 * @param serverUrl The server URL.
 * @param uids An object containing the uidWell, uidWellbore, and uid.
 * @returns An object containing the pathname and search parameters.
 */
const getNavigationPath = (
  lineText: string,
  row: number,
  fullQuery: string,
  serverUrl: string,
  uids: Record<string, string>
) => {
  let { uidWell: wellUid, uidWellbore: wellboreUid, uid } = uids;
  const tag = getTag(lineText);
  const entity = tag.charAt(0).toUpperCase() + tag.slice(1);
  let pathname = null;
  let searchParams = null;
  if (entity === EntityType.Well && uid) {
    pathname = getWellboresViewPath(serverUrl, uid);
  } else if (entity === EntityType.Wellbore && wellUid && uid) {
    pathname = getObjectGroupsViewPath(serverUrl, wellUid, uid);
  } else if (
    Object.values(ObjectType).includes(entity as ObjectType) &&
    wellUid &&
    wellboreUid &&
    uid
  ) {
    if (entity === ObjectType.Log) {
      const logType = getRouterLogType(fullQuery, row);
      if (logType) {
        pathname = getLogObjectViewPath(
          serverUrl,
          wellUid,
          wellboreUid,
          entity,
          logType,
          uid
        );
      }
    } else if (isExpandableGroupObject(entity as ObjectType)) {
      pathname = getObjectViewPath(
        serverUrl,
        wellUid,
        wellboreUid,
        entity,
        uid
      );
    } else {
      pathname = getObjectsViewPath(serverUrl, wellUid, wellboreUid, entity);
    }
  } else if (entity === "LogCurveInfo") {
    // We parse the data to find the corresponding mnemonic, start and end indexes as we need them for the search params.
    const fullQueryRows = fullQuery.split("\n");
    const logType = getRouterLogType(fullQuery, row);
    const parentLine = getParentTag(fullQueryRows, row, true);
    const parentUidMatch = parentLine.match(
      /<log\s+uidWell="([^"]+)"\s+uidWellbore="([^"]+)"\s+uid="([^"]+)"/
    );
    wellUid = parentUidMatch?.[1];
    wellboreUid = parentUidMatch?.[2];
    uid = parentUidMatch?.[3];
    if (logType && wellUid && wellboreUid && uid) {
      const queryFromRow = fullQueryRows.slice(row + 1)?.join("\n");
      const logCurveInfoContent = queryFromRow.slice(
        0,
        queryFromRow.indexOf("</logCurveInfo>")
      );
      const { mnemonic, min, max } = extractLogCurveInfo(logCurveInfoContent);
      const direction = getDirection(fullQuery, row);
      const isDecreasing = direction === WITSML_LOG_ORDERTYPE_DECREASING;
      searchParams = createLogCurveValuesSearchParams(
        isDecreasing ? max : min,
        isDecreasing ? min : max,
        [mnemonic]
      );
      pathname = getLogCurveValuesViewPath(
        serverUrl,
        wellUid,
        wellboreUid,
        ObjectType.Log,
        logType,
        uid
      );
    }
  }
  return { pathname, searchParams };
};

/**
 * Determines the log type based on the index type within the log content surrounding the row from the given query.
 * @param fullQuery The entire query text.
 * @param row The row number of the log tag.
 * @returns The log type as a string.
 */
const getRouterLogType = (fullQuery: string, row: number) => {
  const rowPosition = fullQuery.split("\n").slice(0, row).join("\n").length;
  const startTagIndex = fullQuery.lastIndexOf(
    "<log ",
    rowPosition + fullQuery.split("\n")[row].length
  );
  const endTagIndex = fullQuery.indexOf("</log>", rowPosition);
  if (startTagIndex === -1 || endTagIndex === -1) return null;
  const logContent = fullQuery.slice(startTagIndex, endTagIndex);
  const indexType = logContent.match(/<indexType>([^<]+)<\/indexType>/)?.[1];
  const logType =
    indexType === WITSML_INDEX_TYPE_MD
      ? RouterLogType.DEPTH
      : indexType === WITSML_INDEX_TYPE_DATE_TIME
      ? RouterLogType.TIME
      : null;
  return logType;
};

/**
 * Determines the direction based on the index type within the log content surrounding the row from the given query.
 * @param fullQuery The entire query text.
 * @param row The row number of the log tag.
 * @returns The direction as a string.
 */
const getDirection = (fullQuery: string, row: number) => {
  const rowPosition = fullQuery.split("\n").slice(0, row).join("\n").length;
  const startTagIndex = fullQuery.lastIndexOf(
    "<log ",
    rowPosition + fullQuery.split("\n")[row].length
  );
  const endTagIndex = fullQuery.indexOf("</log>", rowPosition);
  if (startTagIndex === -1 || endTagIndex === -1) return null;
  const logContent = fullQuery.slice(startTagIndex, endTagIndex);
  const direction = logContent.match(/<direction>([^<]+)<\/direction>/)?.[1];
  return direction;
};

/**
 * Extracts the mnemonic, min index, and max index from the logCurveInfo content.
 * @param logCurveInfoContent The content of the logCurveInfo tag.
 * @returns An object containing the mnemonic, min, and max values.
 */
const extractLogCurveInfo = (logCurveInfoContent: string) => {
  const mnemonic = logCurveInfoContent.match(
    /<mnemonic>([^<]+)<\/mnemonic>/
  )?.[1];
  const minDateTimeIndex = logCurveInfoContent.match(
    /<minDateTimeIndex>([^<]+)<\/minDateTimeIndex>/
  )?.[1];
  const maxDateTimeIndex = logCurveInfoContent.match(
    /<maxDateTimeIndex>([^<]+)<\/maxDateTimeIndex>/
  )?.[1];
  const minIndex = logCurveInfoContent.match(
    /<minIndex[^>]*>([^<]+)<\/minIndex>/
  )?.[1];
  const maxIndex = logCurveInfoContent.match(
    /<maxIndex[^>]*>([^<]+)<\/maxIndex>/
  )?.[1];
  const min = minDateTimeIndex ?? minIndex;
  const max = maxDateTimeIndex ?? maxIndex;
  return { mnemonic, min, max };
};

/**
 * Adds a widget to a line element.
 * @param lineElement The line element to which the widget is added.
 * @param widget The React element representing the widget.
 */
const addWidgetToLine = (lineElement: any, widget: ReactElement) => {
  const widgetContainer = document.createElement("span");
  widgetContainer.className = "widget";
  widgetContainer.style.marginTop = "-2px";
  widgetContainer.style.boxSizing = "border-box";
  widgetContainer.style.display = "inline-block";
  widgetContainer.style.verticalAlign = "middle";
  widgetContainer.style.pointerEvents = "auto";

  createRoot(widgetContainer).render(widget);

  lineElement.appendChild(widgetContainer);
};

const StyledEditIcon = styled(Icon)`
  display: inline-block;
  vertical-align: middle;
  transform: scale(0.75);
  cursor: pointer;
  opacity: 0.7;
`;
