import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import { calculateLogTypeDepthId, calculateLogTypeId } from "../../models/wellbore";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import LogObjectContextMenu, { LogObjectContextMenuProps } from "../ContextMenus/LogObjectContextMenu";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface LogObjectRow extends ContentTableRow, LogObject {}

export const LogsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWellbore, selectedLogTypeGroup, selectedServer, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [logs, setLogs] = useState<LogObject[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.logs) {
      setLogs(selectedWellbore.logs.filter((log) => calculateLogTypeId(selectedWellbore, log.indexType) === selectedLogTypeGroup));
    }
  }, [selectedLogTypeGroup, selectedWellbore]);

  const getType = () => {
    return selectedLogTypeGroup === calculateLogTypeDepthId(selectedWellbore) ? ContentType.Number : ContentType.String;
  };

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedLogObjectRows: LogObjectRow[]) => {
    const contextProps: LogObjectContextMenuProps = { checkedLogObjectRows, dispatchNavigation, dispatchOperation, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogObjectContextMenu {...contextProps} />, position } });
  };

  const getTableData = () => {
    return logs.map((log) => {
      return { id: log.uid, ...log };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "runNumber", label: "Run Number", type: ContentType.String },
    { property: "startIndex", label: "StartIndex", type: selectedWellbore ? getType() : ContentType.String },
    { property: "endIndex", label: "EndIndex", type: selectedWellbore ? getType() : ContentType.String },
    { property: "indexType", label: "IndexType", type: ContentType.String },
    { property: "uid", label: "UID", type: ContentType.String }
  ];

  return selectedWellbore ? <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows /> : <></>;
};

export default LogsListView;
