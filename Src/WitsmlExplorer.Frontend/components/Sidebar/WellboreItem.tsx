import React, { useContext, useEffect, useState } from "react";
import TreeItem from "./TreeItem";
import LogObjectService from "../../services/logObjectService";
import Well from "../../models/well";
import Wellbore, { calculateLogGroupId, calculateRigGroupId, calculateTrajectoryGroupId } from "../../models/wellbore";
import LogTypeItem from "./LogTypeItem";
import RigService from "../../services/rigService";
import TrajectoryService from "../../services/trajectoryService";
import TrajectoryItem from "./TrajectoryItem";
import { truncateAbortHandler } from "../../services/apiClient";
import WellboreContextMenu, { WellboreContextMenuProps } from "../ContextMenus/WellboreContextMenu";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import NavigationType from "../../contexts/navigationType";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import { calculateTrajectoryId } from "../../models/trajectory";
import { SelectWellboreAction, ToggleTreeNodeAction } from "../../contexts/navigationStateReducer";
import LogsContextMenu, { LogsContextMenuProps } from "../ContextMenus/LogsContextMenu";
import { IndexCurve } from "../Modals/LogPropertiesModal";

interface WellboreItemProps {
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
  nodeId: string;
}

const WellboreItem = (props: WellboreItemProps): React.ReactElement => {
  const { wellbore, well, selected, nodeId } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedTrajectory, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellboreContextMenuProps = { wellbore, servers, dispatchOperation, dispatchNavigation };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellboreContextMenu {...contextMenuProps} />, position } });
  };

  const onLogsContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const indexCurve = IndexCurve.Depth;
    const contextMenuProps: LogsContextMenuProps = { dispatchOperation, wellbore, servers, indexCurve };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogsContextMenu {...contextMenuProps} />, position } });
  };

  useEffect(() => {
    if (!isFetchingData) {
      return;
    }
    const controller = new AbortController();

    async function getChildren() {
      const getLogs = LogObjectService.getLogs(well.uid, wellbore.uid, controller.signal);
      const getRigs = RigService.getRigs(well.uid, wellbore.uid, controller.signal);
      const getTrajectories = TrajectoryService.getTrajectories(well.uid, wellbore.uid, controller.signal);
      const [logs, rigs, trajectories] = await Promise.all([getLogs, getRigs, getTrajectories]);
      const selectWellbore: SelectWellboreAction = { type: NavigationType.SelectWellbore, payload: { well, wellbore, logs, rigs, trajectories } };
      dispatchNavigation(selectWellbore);
      setIsFetchingData(false);
    }

    getChildren().catch(truncateAbortHandler);

    return () => {
      controller.abort();
    };
  }, [isFetchingData]);

  const onSelectLogGroup = async (well: Well, wellbore: Wellbore, logGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectLogGroup, payload: { well, wellbore, logGroup } });
  };

  const onSelectRigGroup = async (well: Well, wellbore: Wellbore, rigGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectRigGroup, payload: { well, wellbore, rigGroup } });
  };

  const onSelectTrajectoryGroup = async (well: Well, wellbore: Wellbore, trajectoryGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectTrajectoryGroup, payload: { well, wellbore, trajectoryGroup } });
  };

  const onLabelClick = () => {
    const wellboreHasData = wellbore.logs?.length > 0;
    if (wellboreHasData) {
      const payload = { well, wellbore, logs: wellbore.logs, rigs: wellbore.rigs, trajectories: wellbore.trajectories };
      const selectWellbore: SelectWellboreAction = { type: NavigationType.SelectWellbore, payload };
      dispatchNavigation(selectWellbore);
    } else {
      setIsFetchingData(true);
    }
  };

  const onIconClick = () => {
    const wellboreHasData = wellbore.logs?.length > 0;
    if (wellboreHasData) {
      const toggleTreeNode: ToggleTreeNodeAction = { type: NavigationType.ToggleTreeNode, payload: { nodeId: props.nodeId } };
      dispatchNavigation(toggleTreeNode);
    } else {
      setIsFetchingData(true);
    }
  };

  const logGroupId = calculateLogGroupId(wellbore);
  const trajectoryGroupId = calculateTrajectoryGroupId(wellbore);
  const rigGroupId = calculateRigGroupId(wellbore);

  return (
    <TreeItem
      onContextMenu={(event) => onContextMenu(event, wellbore)}
      key={nodeId}
      nodeId={nodeId}
      selected={selected}
      labelText={wellbore.name}
      onLabelClick={onLabelClick}
      onIconClick={onIconClick}
      isActive={wellbore.isActive}
    >
      <TreeItem
        nodeId={logGroupId}
        labelText={"Logs"}
        onLabelClick={() => onSelectLogGroup(well, wellbore, logGroupId)}
        onContextMenu={(event) => onLogsContextMenu(event, wellbore)}
        isActive={wellbore.logs && wellbore.logs.some((log) => log.objectGrowing)}
      >
        <LogTypeItem well={well} wellbore={wellbore} />
      </TreeItem>
      <TreeItem nodeId={rigGroupId} labelText={"Rigs"} onLabelClick={() => onSelectRigGroup(well, wellbore, rigGroupId)} onContextMenu={preventContextMenuPropagation} />
      <TreeItem
        nodeId={trajectoryGroupId}
        labelText={"Trajectories"}
        onLabelClick={() => onSelectTrajectoryGroup(well, wellbore, trajectoryGroupId)}
        onContextMenu={preventContextMenuPropagation}
      >
        {wellbore &&
          wellbore.trajectories &&
          wellbore.trajectories.map((trajectory) => (
            <TrajectoryItem
              key={calculateTrajectoryId(trajectory)}
              trajectoryGroup={trajectoryGroupId}
              trajectory={trajectory}
              well={well}
              wellbore={wellbore}
              nodeId={calculateTrajectoryId(trajectory)}
              selected={selectedTrajectory && selectedTrajectory.uid === trajectory.uid ? true : undefined}
            />
          ))}
      </TreeItem>
    </TreeItem>
  );
};

export default WellboreItem;
