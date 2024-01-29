import { Switch, Typography } from "@equinor/eds-core-react";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useSidebar } from "../../contexts/sidebarContext";
import { SidebarActionType } from "../../contexts/sidebarReducer";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
import {
  calculateLogTypeId,
  calculateObjectGroupId,
  calculateWellNodeId,
  calculateWellboreNodeId
} from "../../models/wellbore";
import ObjectService from "../../services/objectService";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "../Constants";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import LogObjectContextMenu from "../ContextMenus/LogObjectContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
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
  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore, selectedWell, selectedLogTypeGroup } =
    navigationState;

  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const [logs, setLogs] = useState<LogObject[]>([]);
  const [resetCheckedItems, setResetCheckedItems] = useState(false);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { wellUid, wellboreUid, logType } = useParams();
  const { dispatchSidebar } = useSidebar();

  useEffect(() => {
    dispatchSidebar({
      type: SidebarActionType.ExpandTreeNodes,
      payload: {
        nodeIds: [
          calculateWellNodeId(wellUid),
          calculateWellboreNodeId({ wellUid, uid: wellboreUid }),
          calculateObjectGroupId({ wellUid, uid: wellboreUid }, ObjectType.Log),
          calculateLogTypeId(
            { wellUid, uid: wellboreUid },
            logType === "depth"
              ? WITSML_INDEX_TYPE_MD
              : WITSML_INDEX_TYPE_DATE_TIME
          )
        ]
      }
    });
  }, [wellUid, wellboreUid, logType]);

  const filterLogsByType = (logs: LogObject[], logType: string) => {
    return logs?.filter((log) => log.indexType === logType) ?? [];
  };
  useEffect(() => {
    const fetchObjects = async () => {
      const objects = await ObjectService.getObjects(
        wellUid,
        wellboreUid,
        ObjectType.Log
      );
      if (logType === "depth") {
        setLogs(filterLogsByType(objects, WITSML_INDEX_TYPE_MD));
      } else if (logType === "time") {
        setLogs(filterLogsByType(objects, WITSML_INDEX_TYPE_DATE_TIME));
      } else {
        throw Error(`logType=${logType} is not supported`);
      }
    };
    fetchObjects();
  }, [wellUid, wellboreUid, logType]);

  const isTimeIndexed = () => {
    return logType === "time";
  };

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedLogObjectRows: LogObjectRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedLogObjectRows.map((row) => row.logObject),
      wellbore: selectedWellbore
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
        startIndex:
          selectedWellbore && isTimeIndexed()
            ? formatDateString(log.startIndex, timeZone, dateTimeFormat)
            : log.startIndex,
        endIndex:
          selectedWellbore && isTimeIndexed()
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
      type:
        selectedWellbore && isTimeIndexed()
          ? ContentType.DateTime
          : ContentType.Measure
    },
    {
      property: "endIndex",
      label: "endIndex",
      type:
        selectedWellbore && isTimeIndexed()
          ? ContentType.DateTime
          : ContentType.Measure
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
      `/servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        selectedWell.uid
      }/wellbores/${selectedWellbore.uid}/objectgroups/${
        ObjectType.Log
      }/logtypes/${
        log.indexType === WITSML_INDEX_TYPE_DATE_TIME ? "time" : "depth"
      }/objects/${log.uid}`
    );
  };

  useEffect(() => {
    if (resetCheckedItems) {
      setResetCheckedItems(false);
      setSelectedRows([]);
    }
  }, [resetCheckedItems]);

  useEffect(() => {
    setResetCheckedItems(true);
  }, [selectedWellbore, selectedLogTypeGroup]);

  return (
    !resetCheckedItems && (
      <ContentContainer>
        <CommonPanelContainer>
          <Switch
            checked={showGraph}
            onChange={() => setShowGraph(!showGraph)}
          />
          <Typography>
            Gantt view{selectedRows.length > 0 && " (selected logs only)"}
          </Typography>
        </CommonPanelContainer>
        {showGraph ? (
          <LogsGraph selectedLogs={selectedRows} />
        ) : (
          <ContentTable
            viewId={isTimeIndexed() ? "timeLogsListView" : "depthLogsListView"}
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
            downloadToCsvFileName={isTimeIndexed() ? "TimeLogs" : "DepthLogs"}
          />
        )}
      </ContentContainer>
    )
  );
}

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
