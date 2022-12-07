import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import Wellbore from "../../models/wellbore";
import BhaRunService from "../../services/bhaRunService";
import LogObjectService from "../../services/logObjectService";
import MessageObjectService from "../../services/messageObjectService";
import RigService from "../../services/rigService";
import RiskObjectService from "../../services/riskObjectService";
import TrajectoryService from "../../services/trajectoryService";
import TubularService from "../../services/tubularService";
import WbGeometryObjectService from "../../services/wbGeometryService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WellboreContextMenu, { WellboreContextMenuProps } from "../ContextMenus/WellboreContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const WellboresListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, servers } = navigationState;
  const {
    dispatchOperation,
    operationState: { timeZone }
  } = useContext(OperationContext);

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "wellType", label: "Well Type", type: ContentType.String },
    { property: "wellStatus", label: "Well Status", type: ContentType.String },
    { property: "uid", label: "UID Wellbore", type: ContentType.String },
    { property: "dateTimeCreation", label: "Creation date", type: ContentType.DateTime },
    { property: "dateTimeLastChange", label: "Last changed", type: ContentType.DateTime }
  ];

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    const contextMenuProps: WellboreContextMenuProps = { dispatchNavigation, dispatchOperation, servers, wellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellboreContextMenu {...contextMenuProps} />, position } });
  };

  const getTableData = () => {
    return selectedWell.wellbores.map((wellbore) => {
      return {
        ...wellbore,
        id: wellbore.uid,
        dateTimeCreation: formatDateString(wellbore.dateTimeCreation, timeZone),
        dateTimeLastChange: formatDateString(wellbore.dateTimeLastChange, timeZone)
      };
    });
  };

  const onSelect = async (wellbore: any) => {
    const { wellUid, uid } = wellbore;

    const controller = new AbortController();
    const logs = await LogObjectService.getLogs(wellbore.wellUid, uid, controller.signal);
    const rigs = await RigService.getRigs(wellUid, uid, controller.signal);
    const trajectories = await TrajectoryService.getTrajectories(wellUid, uid, controller.signal);
    const bhaRuns = await BhaRunService.getBhaRuns(wellUid, uid, controller.signal);
    const tubulars = await TubularService.getTubulars(wellUid, uid, controller.signal);
    const messages = await MessageObjectService.getMessages(wellUid, uid, controller.signal);
    const risks = await RiskObjectService.getRisks(wellUid, uid, controller.signal);
    const wbGeometrys = await WbGeometryObjectService.getWbGeometrys(wellUid, uid, controller.signal);
    dispatchNavigation({
      type: NavigationType.SelectWellbore,
      payload: { well: selectedWell, wellbore, bhaRuns, logs, rigs, trajectories, messages, risks, tubulars, wbGeometrys }
    });
  };

  return selectedWell && <ContentTable columns={columns} data={getTableData()} onSelect={onSelect} onContextMenu={onContextMenu} />;
};

export default WellboresListView;
