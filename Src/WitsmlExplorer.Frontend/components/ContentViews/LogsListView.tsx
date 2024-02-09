import { Switch, Typography } from "@equinor/eds-core-react";
import { MouseEvent, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetObjects } from "../../hooks/query/useGetObjects";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "../Constants";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import LogObjectContextMenu from "../ContextMenus/LogObjectContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
import ProgressSpinner from "../ProgressSpinner";
import LogsGraph from "./Charts/LogsGraph";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface LogObjectRow extends ContentTableRow, LogObject {
  logObject: LogObject;
}

export default function LogsListView() {
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { wellUid, wellboreUid, logType } = useParams();
  const { wellbore, isFetching: isFetchingWellbore } = useGetWellbore(
    authorizationState?.server,
    wellUid,
    wellboreUid
  );
  const { objects: allLogs, isFetching: isFetchingLogs } = useGetObjects(
    authorizationState?.server,
    wellUid,
    wellboreUid,
    ObjectType.Log
  );
  const isTimeIndexed = logType === "time";
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
      checkedObjects: checkedLogObjectRows.map((row) => row.logObject),
      wellbore
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
    return logs.map((log) => {
      return {
        ...log,
        id: log.uid,
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
      `/servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${
        ObjectType.Log
      }/logtypes/${
        log.indexType === WITSML_INDEX_TYPE_DATE_TIME ? "time" : "depth"
      }/objects/${log.uid}`
    );
  };

  if (isFetching) {
    return <ProgressSpinner message={`Fetching Logs`} />;
  }

  return (
    <ContentContainer>
      <CommonPanelContainer>
        <Switch checked={showGraph} onChange={() => setShowGraph(!showGraph)} />
        <Typography>
          Gantt view{selectedRows.length > 0 && " (selected logs only)"}
        </Typography>
      </CommonPanelContainer>
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
  );
}

const filterLogsByType = (logs: LogObject[], logType: string) => {
  return logs?.filter((log) => log.indexType === logType) ?? [];
};

const CommonPanelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  > p {
    margin-left: -1rem;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
