import React, { useContext } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import LogObjectService from "../../services/logObjectService";
import RigService from "../../services/rigService";
import TrajectoryService from "../../services/trajectoryService";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import WellboreContextMenu, { WellboreContextMenuProps } from "../ContextMenus/WellboreContextMenu";
import OperationType from "../../contexts/operationType";
import OperationContext from "../../contexts/operationContext";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";

export const WellboresListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "wellType", label: "Well Type", type: ContentType.String },
    { property: "wellStatus", label: "Well Status", type: ContentType.String },
    { property: "uid", label: "UID Wellbore", type: ContentType.String },
    { property: "dateTimeCreation", label: "Creation date", type: ContentType.Date },
    { property: "dateTimeLastChange", label: "Last changed", type: ContentType.Date }
  ];

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    const contextMenuProps: WellboreContextMenuProps = { dispatchNavigation, dispatchOperation, servers, wellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellboreContextMenu {...contextMenuProps} />, position } });
  };

  const onSelect = async (wellbore: any) => {
    const { wellUid, uid } = wellbore;

    const controller = new AbortController();
    const logs = await LogObjectService.getLogs(wellbore.wellUid, uid, controller.signal);
    const rigs = await RigService.getRigs(wellUid, uid, controller.signal);
    const trajectories = await TrajectoryService.getTrajectories(wellUid, uid, controller.signal);
    dispatchNavigation({ type: NavigationType.SelectWellbore, payload: { well: selectedWell, wellbore, logs, rigs, trajectories } });
  };

  return selectedWell && <ContentTable columns={columns} data={[...selectedWell.wellbores]} onSelect={onSelect} onContextMenu={onContextMenu} />;
};

export default WellboresListView;
