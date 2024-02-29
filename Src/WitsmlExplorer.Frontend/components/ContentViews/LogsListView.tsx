import { Switch, Typography } from "@equinor/eds-core-react";
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
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import { calculateLogTypeId, calculateLogTypeTimeId } from "models/wellbore";
import React, { useContext, useEffect, useState } from "react";
import {
  ContentContainer,
  CommonPanelContainer
} from "../StyledComponents/Container";

export interface LogObjectRow extends ContentTableRow, LogObject {
  logObject: LogObject;
}

export const LogsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
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

  useEffect(() => {
    if (selectedWellbore?.logs) {
      setLogs(
        selectedWellbore.logs.filter(
          (log) =>
            calculateLogTypeId(selectedWellbore, log.indexType) ===
            selectedLogTypeGroup
        )
      );
    }
  }, [selectedLogTypeGroup, selectedWellbore]);

  const isTimeIndexed = () => {
    return selectedLogTypeGroup === calculateLogTypeTimeId(selectedWellbore);
  };

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
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
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: {
        object: log.logObject,
        well: selectedWell,
        wellbore: selectedWellbore,
        objectType: ObjectType.Log
      }
    });
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

  return selectedWellbore && !resetCheckedItems ? (
    <ContentContainer>
      <CommonPanelContainer>
        <Switch checked={showGraph} onChange={() => setShowGraph(!showGraph)} />
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
  ) : (
    <></>
  );
};

export default LogsListView;
