import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import LogObjectContextMenu from "components/ContextMenus/LogObjectContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TreeItem from "components/Sidebar/TreeItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import LogObject from "models/logObject";
import { MouseEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface LogItemProps {
  log: LogObject;
  wellUid: string;
  wellboreUid: string;
  logGroup: string;
  logTypeGroup: string;
  selected: boolean;
  nodeId: string;
  objectGrowing: boolean;
  to: string;
}

export default function LogItem({
  log: log,
  wellUid,
  wellboreUid,
  selected,
  nodeId,
  objectGrowing,
  to
}: LogItemProps) {
  const { dispatchOperation } = useContext(OperationContext);
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const { wellbore } = useGetWellbore(connectedServer, wellUid, wellboreUid);

  const onContextMenu = (event: MouseEvent<HTMLLIElement>, log: LogObject) => {
    preventContextMenuPropagation(event);
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: [log],
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

  return (
    <TreeItem
      onContextMenu={(event) => onContextMenu(event, log)}
      key={nodeId}
      nodeId={nodeId}
      labelText={log.runNumber ? `${log.name} (${log.runNumber})` : log.name}
      selected={selected}
      isActive={objectGrowing}
      onLabelClick={() => {
        navigate(to);
      }}
    />
  );
}
