import React, { useContext, useEffect, useState } from "react";
import { SelectWellboreAction, ToggleTreeNodeAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { calculateObjectNodeId } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, {
  calculateBhaRunGroupId,
  calculateLogGroupId,
  calculateMessageGroupId,
  calculateMudLogGroupId,
  calculateRigGroupId,
  calculateRiskGroupId,
  calculateTrajectoryGroupId,
  calculateTubularGroupId,
  calculateWbGeometryGroupId
} from "../../models/wellbore";
import { truncateAbortHandler } from "../../services/apiClient";
import BhaRunService from "../../services/bhaRunService";
import { JobType } from "../../services/jobService";
import LogObjectService from "../../services/logObjectService";
import MessageObjectService from "../../services/messageObjectService";
import MudLogObjectService from "../../services/mudLogObjectService";
import RigService from "../../services/rigService";
import RiskObjectService from "../../services/riskObjectService";
import TrajectoryService from "../../services/trajectoryService";
import TubularService from "../../services/tubularService";
import WbGeometryObjectService from "../../services/wbGeometryService";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import LogsContextMenu, { LogsContextMenuProps } from "../ContextMenus/LogsContextMenu";
import ObjectsSidebarContextMenu, { ObjectsSidebarContextMenuProps } from "../ContextMenus/ObjectsSidebarContextMenu";
import TubularsContextMenu, { TubularsContextMenuProps } from "../ContextMenus/TubularsContextMenu";
import WellboreContextMenu, { WellboreContextMenuProps } from "../ContextMenus/WellboreContextMenu";
import { IndexCurve } from "../Modals/LogPropertiesModal";
import LogTypeItem from "./LogTypeItem";
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
  const { selectedTrajectory, selectedTubular, selectedWbGeometry, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellboreContextMenuProps = { wellbore, servers, dispatchOperation, dispatchNavigation };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellboreContextMenu {...contextMenuProps} />, position } });
  };

  const onObjectsContextMenu = (event: React.MouseEvent<HTMLLIElement>, objectType: ObjectType, jobType: JobType) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: ObjectsSidebarContextMenuProps = { dispatchOperation, wellbore, servers, objectType, jobType };
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
      const getBhaRuns = BhaRunService.getBhaRuns(well.uid, wellbore.uid, controller.signal);
      const getLogs = LogObjectService.getLogs(well.uid, wellbore.uid, controller.signal);
      const getRigs = RigService.getRigs(well.uid, wellbore.uid, controller.signal);
      const getTrajectories = TrajectoryService.getTrajectories(well.uid, wellbore.uid, controller.signal);
      const getMessages = MessageObjectService.getMessages(well.uid, wellbore.uid, controller.signal);
      const getMudLogs = MudLogObjectService.getMudLogs(well.uid, wellbore.uid, controller.signal);
      const getRisks = RiskObjectService.getRisks(well.uid, wellbore.uid, controller.signal);
      const getTubulars = TubularService.getTubulars(well.uid, wellbore.uid, controller.signal);
      const getWbGeometrys = WbGeometryObjectService.getWbGeometrys(well.uid, wellbore.uid, controller.signal);
      const [bhaRuns, logs, rigs, trajectories, messages, mudLogs, risks, tubulars, wbGeometrys] = await Promise.all([
        getBhaRuns,
        getLogs,
        getRigs,
        getTrajectories,
        getMessages,
        getMudLogs,
        getRisks,
        getTubulars,
        getWbGeometrys
      ]);
      const selectWellbore: SelectWellboreAction = {
        type: NavigationType.SelectWellbore,
        payload: { well, wellbore, bhaRuns, logs, rigs, trajectories, messages, mudLogs, risks, tubulars, wbGeometrys }
      };
      dispatchNavigation(selectWellbore);
      setIsFetchingData(false);
    }

    getChildren().catch(truncateAbortHandler);

    return () => {
      controller.abort();
    };
  }, [isFetchingData]);

  const onSelectBhaRunGroup = async (well: Well, wellbore: Wellbore, bhaRunGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectBhaRunGroup, payload: { well, wellbore, bhaRunGroup } });
  };

  const onSelectLogGroup = async (well: Well, wellbore: Wellbore, logGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectLogGroup, payload: { well, wellbore, logGroup } });
  };

  const onSelectMessageGroup = async (well: Well, wellbore: Wellbore, messageGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectMessageGroup, payload: { well, wellbore, messageGroup } });
  };

  const onSelectMudLogGroup = async (well: Well, wellbore: Wellbore, mudLogGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectMudLogGroup, payload: { well, wellbore, mudLogGroup } });
  };

  const onSelectRiskGroup = async (well: Well, wellbore: Wellbore, riskGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectRiskGroup, payload: { well, wellbore, riskGroup } });
  };

  const onSelectWbGeometryGroup = async (well: Well, wellbore: Wellbore, wbGeometryGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectWbGeometryGroup, payload: { well, wellbore, wbGeometryGroup } });
  };

  const onSelectRigGroup = async (well: Well, wellbore: Wellbore, rigGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectRigGroup, payload: { well, wellbore, rigGroup } });
  };

  const onSelectTrajectoryGroup = async (well: Well, wellbore: Wellbore, trajectoryGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectTrajectoryGroup, payload: { well, wellbore, trajectoryGroup } });
  };

  const onSelectTubularGroup = async (well: Well, wellbore: Wellbore, tubularGroup: string) => {
    dispatchNavigation({ type: NavigationType.SelectTubularGroup, payload: { well, wellbore, tubularGroup } });
  };

  const onLabelClick = () => {
    const wellboreHasData = wellbore.logs?.length > 0;
    if (wellboreHasData) {
      const payload = {
        well,
        wellbore,
        bhaRuns: wellbore.bhaRuns,
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
    if (wellboreHasData) {
      const toggleTreeNode: ToggleTreeNodeAction = { type: NavigationType.ToggleTreeNode, payload: { nodeId: props.nodeId } };
      dispatchNavigation(toggleTreeNode);
    } else {
      setIsFetchingData(true);
    }
  };

  const bhaRunGroupId = calculateBhaRunGroupId(wellbore);
  const logGroupId = calculateLogGroupId(wellbore);
  const messageGroupId = calculateMessageGroupId(wellbore);
  const mudLogGroupId = calculateMudLogGroupId(wellbore);
  const riskGroupId = calculateRiskGroupId(wellbore);
  const trajectoryGroupId = calculateTrajectoryGroupId(wellbore);
  const rigGroupId = calculateRigGroupId(wellbore);
  const tubularGroupId = calculateTubularGroupId(wellbore);
  const wbGeometryGroupId = calculateWbGeometryGroupId(wellbore);

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
        nodeId={bhaRunGroupId}
        labelText={"BhaRuns"}
        onLabelClick={() => onSelectBhaRunGroup(well, wellbore, bhaRunGroupId)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.BhaRun, JobType.CopyBhaRun)}
      />

      <TreeItem
        nodeId={logGroupId}
        labelText={"Logs"}
        onLabelClick={() => onSelectLogGroup(well, wellbore, logGroupId)}
        onContextMenu={(event) => onLogsContextMenu(event, wellbore)}
        isActive={wellbore.logs && wellbore.logs.some((log) => log.objectGrowing)}
      >
        <LogTypeItem well={well} wellbore={wellbore} />
      </TreeItem>

      <TreeItem
        nodeId={messageGroupId}
        labelText={"Messages"}
        onLabelClick={() => onSelectMessageGroup(well, wellbore, messageGroupId)}
        onContextMenu={preventContextMenuPropagation}
      />
      <TreeItem
        nodeId={mudLogGroupId}
        labelText={"MudLogs"}
        onLabelClick={() => onSelectMudLogGroup(well, wellbore, mudLogGroupId)}
        onContextMenu={preventContextMenuPropagation}
      />
      <TreeItem
        nodeId={rigGroupId}
        labelText={"Rigs"}
        onLabelClick={() => onSelectRigGroup(well, wellbore, rigGroupId)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.Rig, JobType.CopyRig)}
      />
      <TreeItem
        nodeId={riskGroupId}
        labelText={"Risks"}
        onLabelClick={() => onSelectRiskGroup(well, wellbore, riskGroupId)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.Risk, JobType.CopyRisk)}
      />
      <TreeItem
        nodeId={trajectoryGroupId}
        labelText={"Trajectories"}
        onLabelClick={() => onSelectTrajectoryGroup(well, wellbore, trajectoryGroupId)}
        onContextMenu={(event) => onObjectsContextMenu(event, ObjectType.Trajectory, JobType.CopyTrajectory)}
      >
        {wellbore &&
          wellbore.trajectories &&
          wellbore.trajectories.map((trajectory) => (
            <TrajectoryItem
              key={calculateObjectNodeId(trajectory, ObjectType.Trajectory)}
              trajectoryGroup={trajectoryGroupId}
              trajectory={trajectory}
              well={well}
              wellbore={wellbore}
              nodeId={calculateObjectNodeId(trajectory, ObjectType.Trajectory)}
              selected={selectedTrajectory && selectedTrajectory.uid === trajectory.uid ? true : undefined}
            />
          ))}
      </TreeItem>
      <TreeItem
        nodeId={tubularGroupId}
        labelText={"Tubulars"}
        onLabelClick={() => onSelectTubularGroup(well, wellbore, tubularGroupId)}
        onContextMenu={(event) => onTubularsContextMenu(event, wellbore)}
      >
        {wellbore &&
          wellbore.tubulars &&
          wellbore.tubulars.map((tubular) => (
            <TubularItem
              key={calculateObjectNodeId(tubular, ObjectType.Tubular)}
              tubularGroup={tubularGroupId}
              tubular={tubular}
              well={well}
              wellbore={wellbore}
              nodeId={calculateObjectNodeId(tubular, ObjectType.Tubular)}
              selected={selectedTubular && selectedTubular.uid === tubular.uid ? true : undefined}
            />
          ))}
      </TreeItem>
      <TreeItem
        nodeId={wbGeometryGroupId}
        labelText={"WbGeometries"}
        onLabelClick={() => onSelectWbGeometryGroup(well, wellbore, wbGeometryGroupId)}
        onContextMenu={preventContextMenuPropagation}
      >
        {wellbore &&
          wellbore.wbGeometrys &&
          wellbore.wbGeometrys.map((wbGeometry) => (
            <WbGeometryItem
              key={calculateObjectNodeId(wbGeometry, ObjectType.WbGeometry)}
              wbGeometryGroup={wbGeometryGroupId}
              wbGeometry={wbGeometry}
              well={well}
              wellbore={wellbore}
              nodeId={calculateObjectNodeId(wbGeometry, ObjectType.WbGeometry)}
              selected={selectedWbGeometry && selectedWbGeometry.uid === wbGeometry.uid ? true : undefined}
            />
          ))}
      </TreeItem>
    </TreeItem>
  );
};

export default WellboreItem;
