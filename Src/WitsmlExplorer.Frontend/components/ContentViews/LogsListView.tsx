import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
import { calculateLogTypeId, calculateLogTypeTimeId } from "../../models/wellbore";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import LogObjectContextMenu from "../ContextMenus/LogObjectContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface LogObjectRow extends ContentTableRow, LogObject {
  logObject: LogObject;
}

export const LogsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWellbore, selectedWell, selectedLogTypeGroup } = navigationState;

  const {
    dispatchOperation,
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [logs, setLogs] = useState<LogObject[]>([]);
  const [resetCheckedItems, setResetCheckedItems] = useState(false);

  useEffect(() => {
    if (selectedWellbore?.logs) {
      setLogs(selectedWellbore.logs.filter((log) => calculateLogTypeId(selectedWellbore, log.indexType) === selectedLogTypeGroup));
    }
  }, [selectedLogTypeGroup, selectedWellbore]);

  const isTimeIndexed = () => {
    return selectedLogTypeGroup === calculateLogTypeTimeId(selectedWellbore);
  };

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedLogObjectRows: LogObjectRow[]) => {
    const contextProps: ObjectContextMenuProps = { checkedObjects: checkedLogObjectRows.map((row) => row.logObject), wellbore: selectedWellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogObjectContextMenu {...contextProps} />, position } });
  };

  const getTableData = (): LogObjectRow[] => {
    return logs.map((log, index) => {
      return {
        ...log,
        id: index,
        startIndex: selectedWellbore && isTimeIndexed() ? formatDateString(log.startIndex, timeZone) : log.startIndex,
        endIndex: selectedWellbore && isTimeIndexed() ? formatDateString(log.endIndex, timeZone) : log.endIndex,
        dTimCreation: formatDateString(log.commonData.dTimCreation, timeZone),
        dTimLastChange: formatDateString(log.commonData.dTimLastChange, timeZone),
        logObject: log
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "runNumber", label: "runNumber", type: ContentType.String },
    { property: "startIndex", label: "startIndex", type: selectedWellbore && isTimeIndexed() ? ContentType.DateTime : ContentType.Measure },
    { property: "endIndex", label: "endIndex", type: selectedWellbore && isTimeIndexed() ? ContentType.DateTime : ContentType.Measure },
    { property: "indexType", label: "indexType", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "dTimCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
    { property: "dTimLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime }
  ];

  const onSelect = (log: LogObjectRow) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: { object: log.logObject, well: selectedWell, wellbore: selectedWellbore, objectType: ObjectType.Log }
    });
  };

  useEffect(() => {
    if (resetCheckedItems) {
      setResetCheckedItems(false);
    }
  }, [resetCheckedItems]);

  useEffect(() => {
    setResetCheckedItems(true);
  }, [selectedWellbore, selectedLogTypeGroup]);

  return selectedWellbore && !resetCheckedItems ? <ContentTable columns={columns} onSelect={onSelect} data={getTableData()} onContextMenu={onContextMenu} checkableRows /> : <></>;
};

export default LogsListView;
