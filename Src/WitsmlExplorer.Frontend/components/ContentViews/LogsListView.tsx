import { EdsProvider, Switch, Typography } from "@equinor/eds-core-react";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "components/Constants";
import LogsGraph from "components/ContentViews/Charts/LogsGraph";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import LogObjectContextMenu from "components/ContextMenus/LogObjectContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import formatDateString from "components/DateFormatter";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import { UserTheme } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import { MouseEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import { RouterLogType } from "routes/routerConstants";
import { getNameOccurrenceSuffix } from "tools/logSameNamesHelper";
import {
  CommonPanelContainer,
  ContentContainer
} from "../StyledComponents/Container";
import { normaliseThemeForEds } from "../../tools/themeHelpers.ts";
import { getLogObjectViewPath } from "routes/utils/pathBuilder";

export interface LogObjectRow extends ContentTableRow, LogObject {
  logObject: LogObject;
}

export default function LogsListView() {
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat, theme }
  } = useOperationState();
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const { wellUid, wellboreUid, logType } = useParams();
  const {
    wellbore,
    isFetching: isFetchingWellbore,
    isFetched: isFetchedWellbore
  } = useGetWellbore(connectedServer, wellUid, wellboreUid);
  const { objects: allLogs, isFetching: isFetchingLogs } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Log
  );
  const isTimeIndexed = logType === RouterLogType.TIME;
  const logs = filterLogsByType(
    allLogs,
    isTimeIndexed ? WITSML_INDEX_TYPE_DATE_TIME : WITSML_INDEX_TYPE_MD
  );
  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log, logType);
  const isFetching = isFetchingWellbore || isFetchingLogs;

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedLogObjectRows: LogObjectRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedLogObjectRows.map((row) => row.logObject)
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <LogObjectContextMenu {...contextProps} />,
        position
      }
    });
  };

  const getTableData = (): LogObjectRow[] => {
    const result = logs.map((log) => {
      return {
        ...log,
        id: log.uid,

        name: log.name + getNameOccurrenceSuffix(logs, log),
        startIndex: isTimeIndexed
          ? formatDateString(log.startIndex, timeZone, dateTimeFormat)
          : log.startIndex,
        endIndex: isTimeIndexed
          ? formatDateString(log.endIndex, timeZone, dateTimeFormat)
          : log.endIndex,
        dTimCreation: formatDateString(
          log.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          log.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        logObject: log
      };
    });
    return result.sort((a, b) => a.name.localeCompare(b.name));
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    {
      property: "startIndex",
      label: "startIndex",
      type: isTimeIndexed ? ContentType.DateTime : ContentType.Measure
    },
    {
      property: "endIndex",
      label: "endIndex",
      type: isTimeIndexed ? ContentType.DateTime : ContentType.Measure
    },
    { property: "mnemonics", label: "mnemonics", type: ContentType.Number },
    {
      property: "serviceCompany",
      label: "serviceCompany",
      type: ContentType.String
    },
    { property: "runNumber", label: "runNumber", type: ContentType.String },
    { property: "indexType", label: "indexType", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    }
  ];

  const onSelect = (log: LogObjectRow) => {
    navigate(
      getLogObjectViewPath(
        connectedServer.url,
        log.wellUid,
        log.wellboreUid,
        ObjectType.Log,
        (log as LogObject)?.indexType === WITSML_INDEX_TYPE_MD
          ? RouterLogType.DEPTH
          : RouterLogType.TIME,
        log.uid
      )
    );
  };

  if (isFetchedWellbore && !wellbore) {
    return <ItemNotFound itemType={ObjectType.Log} />;
  }

  return (
    <>
      {isFetching && <ProgressSpinnerOverlay message="Fetching Logs" />}
      <ContentContainer>
        <EdsProvider density={normaliseThemeForEds(theme)}>
          <CommonPanelContainer>
            <Switch
              checked={showGraph}
              onChange={() => setShowGraph(!showGraph)}
              size={theme === UserTheme.Compact ? "small" : "default"}
            />
            <Typography>
              Gantt view{selectedRows.length > 0 && " (selected logs only)"}
            </Typography>
          </CommonPanelContainer>
        </EdsProvider>
        {showGraph ? (
          <LogsGraph logs={selectedRows.length > 0 ? selectedRows : logs} />
        ) : (
          <ContentTable
            viewId={isTimeIndexed ? "timeLogsListView" : "depthLogsListView"}
            columns={columns}
            onSelect={onSelect}
            data={getTableData()}
            onContextMenu={onContextMenu}
            onRowSelectionChange={(rows) =>
              setSelectedRows(rows as LogObjectRow[])
            }
            checkableRows
            showRefresh
            initiallySelectedRows={selectedRows}
            downloadToCsvFileName={isTimeIndexed ? "TimeLogs" : "DepthLogs"}
          />
        )}
      </ContentContainer>
    </>
  );
}

const filterLogsByType = (logs: LogObject[], logType: string) => {
  return logs?.filter((log) => log.indexType === logType) ?? [];
};
