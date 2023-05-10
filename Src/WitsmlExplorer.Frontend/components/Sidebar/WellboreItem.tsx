import React, { useCallback, useContext, useEffect, useState } from "react";
import { SelectWellboreAction, ToggleTreeNodeAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import ObjectOnWellbore, { calculateObjectNodeId } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, { calculateObjectGroupId } from "../../models/wellbore";
import { truncateAbortHandler } from "../../services/apiClient";
import WellboreService from "../../services/wellboreService";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import LogsContextMenu, { LogsContextMenuProps } from "../ContextMenus/LogsContextMenu";
import ObjectsSidebarContextMenu, { ObjectsSidebarContextMenuProps } from "../ContextMenus/ObjectsSidebarContextMenu";
import TubularsContextMenu, { TubularsContextMenuProps } from "../ContextMenus/TubularsContextMenu";
import WellboreContextMenu, { WellboreContextMenuProps } from "../ContextMenus/WellboreContextMenu";
import { IndexCurve } from "../Modals/LogPropertiesModal";
import LogTypeItem from "./LogTypeItem";
import MudLogItem from "./MudLogItem";
import TrajectoryItem from "./TrajectoryItem";
import TreeItem from "./TreeItem";
import TubularItem from "./TubularItem";
import WbGeometryItem from "./WbGeometryItem";

interface WellboreItemProps {
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
  nodeId: string;
}

const WellboreItem = (props: WellboreItemProps): React.ReactElement => {
  const { wellbore, well, selected, nodeId } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedObject, selectedObjectGroup, servers, expandedTreeNodes } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellboreContextMenuProps = { wellbore, servers, dispatchOperation, dispatchNavigation };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellboreContextMenu {...contextMenuProps} />, position } });
  };

  const onObjectsContextMenu = (event: React.MouseEvent<HTMLLIElement>, objectType: ObjectType) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: ObjectsSidebarContextMenuProps = { dispatchOperation, wellbore, servers, objectType };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <ObjectsSidebarContextMenu {...contextMenuProps} />, position } });
  };

  const onLogsContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const indexCurve = IndexCurve.Depth;
    const contextMenuProps: LogsContextMenuProps = { dispatchOperation, wellbore, servers, indexCurve };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogsContextMenu {...contextMenuProps} />, position } });
  };

  const onTubularsContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TubularsContextMenuProps = { dispatchNavigation, dispatchOperation, wellbore, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TubularsContextMenu {...contextMenuProps} />, position } });
  };

  useEffect(() => {
    if (!isFetchingData) {
      return;
    }
    const controller = new AbortController();

    async function getChildren() {
      const wellboreObjects = await WellboreService.getWellboreObjects(well.uid, wellbore.uid);
      const selectWellbore: SelectWellboreAction = {
        type: NavigationType.SelectWellbore,
        payload: { well, wellbore, ...wellboreObjects }
      };
      dispatchNavigation(selectWellbore);
      setIsFetchingData(false);
    }

    getChildren().catch(truncateAbortHandler);

    return () => {
      controller.abort();
    };
  }, [isFetchingData]);

  const onSelectObjectGroup = async (well: Well, wellbore: Wellbore, objectType: ObjectType) => {
    dispatchNavigation({ type: NavigationType.SelectObjectGroup, payload: { well, wellbore, objectType } });
  };

  const onLabelClick = () => {
    const wellboreHasData = wellbore.logs?.length > 0;
    if (wellboreHasData) {
      const payload = {
        well,
        wellbore,
        bhaRuns: wellbore.bhaRuns,
        changeLogs: wellbore.changeLogs,
        formationMarkers: wellbore.formationMarkers,
        logs: wellbore.logs,
        rigs: wellbore.rigs,
        trajectories: wellbore.trajectories,
        messages: wellbore.messages,
        mudLogs: wellbore.mudLogs,
        risks: wellbore.risks,
        tubulars: wellbore.tubulars,
        wbGeometrys: wellbore.wbGeometrys
      };
      const selectWellbore: SelectWellboreAction = { type: NavigationType.SelectWellbore, payload };
      dispatchNavigation(selectWellbore);
    } else {
      setIsFetchingData(true);
    }
  };

  const onIconClick = () => {
    const wellboreHasData = wellbore.logs?.length > 0;
    if (wellboreHasData || expandedTreeNodes?.includes(props.nodeId)) {
      const toggleTreeNode: ToggleTreeNodeAction = { type: NavigationType.ToggleTreeNode, payload: { nodeId: props.nodeId } };
      dispatchNavigation(toggleTreeNode);
    } else {
      setIsFetchingData(true);
    }
  };

  const isSelected = useCallback(
    (objectType: ObjectType, objectOnWellbore: ObjectOnWellbore) => {
      return selectedObject &&
        selectedObjectGroup === objectType &&
        selectedObject.uid === objectOnWellbore.uid &&
        selectedObject.wellboreUid === objectOnWellbore.wellboreUid &&
        selectedObject.wellUid === objectOnWellbore.wellUid
        ? true
        : undefined;
    },
    [selectedObject, selectedObjectGroup]
  );

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
      isLoading={isFetchingData}
    >
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.BhaRun)}
        labelText={"BhaRuns"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.BhaRun)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.BhaRun)}
      />
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.ChangeLog)}
        labelText={"ChangeLogs"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.ChangeLog)}
        onContextMenu={preventContextMenuPropagation}
      />
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.FormationMarker)}
        labelText={"FormationMarkers"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.FormationMarker)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.FormationMarker)}
      />
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.Log)}
        labelText={"Logs"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.Log)}
        onContextMenu={(event) => onLogsContextMenu(event, wellbore)}
        isActive={wellbore.logs && wellbore.logs.some((log) => log.objectGrowing)}
      >
        <LogTypeItem well={well} wellbore={wellbore} />
      </TreeItem>
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.Message)}
        labelText={"Messages"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.Message)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.Message)}
      />
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.MudLog)}
        labelText={"MudLogs"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.MudLog)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.MudLog)}
      >
        {wellbore &&
          wellbore.mudLogs &&
          wellbore.mudLogs.map((mudLog) => (
            <MudLogItem
              key={calculateObjectNodeId(mudLog, ObjectType.MudLog)}
              mudLog={mudLog}
              well={well}
              wellbore={wellbore}
              nodeId={calculateObjectNodeId(mudLog, ObjectType.MudLog)}
              selected={isSelected(ObjectType.MudLog, mudLog)}
            />
          ))}
      </TreeItem>
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.Rig)}
        labelText={"Rigs"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.Rig)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.Rig)}
      />
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.Risk)}
        labelText={"Risks"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.Risk)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.Risk)}
      />
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.Trajectory)}
        labelText={"Trajectories"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.Trajectory)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.Trajectory)}
      >
        {wellbore &&
          wellbore.trajectories &&
          wellbore.trajectories.map((trajectory) => (
            <TrajectoryItem
              key={calculateObjectNodeId(trajectory, ObjectType.Trajectory)}
              trajectory={trajectory}
              well={well}
              wellbore={wellbore}
              nodeId={calculateObjectNodeId(trajectory, ObjectType.Trajectory)}
              selected={isSelected(ObjectType.Trajectory, trajectory)}
            />
          ))}
      </TreeItem>
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.Tubular)}
        labelText={"Tubulars"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.Tubular)}
        onContextMenu={(event) => onTubularsContextMenu(event, wellbore)}
      >
        {wellbore &&
          wellbore.tubulars &&
          wellbore.tubulars.map((tubular) => (
            <TubularItem
              key={calculateObjectNodeId(tubular, ObjectType.Tubular)}
              tubular={tubular}
              well={well}
              wellbore={wellbore}
              nodeId={calculateObjectNodeId(tubular, ObjectType.Tubular)}
              selected={isSelected(ObjectType.Tubular, tubular)}
            />
          ))}
      </TreeItem>
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, ObjectType.WbGeometry)}
        labelText={"WbGeometries"}
        onLabelClick={() => onSelectObjectGroup(well, wellbore, ObjectType.WbGeometry)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.WbGeometry)}
      >
        {wellbore &&
          wellbore.wbGeometrys &&
          wellbore.wbGeometrys.map((wbGeometry) => (
            <WbGeometryItem
              key={calculateObjectNodeId(wbGeometry, ObjectType.WbGeometry)}
              wbGeometry={wbGeometry}
              well={well}
              wellbore={wellbore}
              nodeId={calculateObjectNodeId(wbGeometry, ObjectType.WbGeometry)}
              selected={isSelected(ObjectType.WbGeometry, wbGeometry)}
            />
          ))}
      </TreeItem>
    </TreeItem>
  );
};

export default WellboreItem;
