import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import LogObject from "../../models/logObject";
import LogObjectContextMenu, { LogObjectContextMenuProps } from "../ContextMenus/LogObjectContextMenu";
import { calculateLogTypeDepthId, calculateLogTypeId } from "../../models/wellbore";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import NavigationType from "../../contexts/navigationType";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";

export const LogsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore, selectedLogTypeGroup, selectedServer, servers } = navigationState;
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

  const onSelect = (log: any) => {
    dispatchNavigation({
      type: NavigationType.SelectLogObject,
      payload: { log, well: selectedWell, wellbore: selectedWellbore }
    });
  };

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, log: LogObject) => {
    const contextProps: LogObjectContextMenuProps = { dispatchNavigation, dispatchOperation, logObject: log, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogObjectContextMenu {...contextProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "runNumber", label: "Run Number", type: ContentType.String },
    { property: "startIndex", label: "StartIndex", type: selectedWellbore ? getType() : ContentType.String },
    { property: "endIndex", label: "EndIndex", type: selectedWellbore ? getType() : ContentType.String },
    { property: "indexType", label: "IndexType", type: ContentType.String },
    { property: "uid", label: "UID", type: ContentType.String }
  ];

  return selectedWellbore ? <ContentTable columns={columns} data={logs} onContextMenu={onContextMenu} onSelect={onSelect} checkableRows /> : <></>;
};

export default LogsListView;
