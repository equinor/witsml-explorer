import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import Trajectory from "../../models/trajectory";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import TrajectoryContextMenu, { TrajectoryContextMenuProps } from "../ContextMenus/TrajectoryContextMenu";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";
import OperationContext from "../../contexts/operationContext";

export const TrajectoriesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, selectedWell, selectedWellbore, selectedTrajectoryGroup } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);

  useEffect(() => {
    if (selectedWellbore?.trajectories) {
      setTrajectories(selectedWellbore.trajectories);
    }
  }, [selectedWellbore?.trajectories]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, trajectory: Trajectory) => {
    const contextProps: TrajectoryContextMenuProps = { dispatchNavigation, dispatchOperation, selectedServer, trajectory };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TrajectoryContextMenu {...contextProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "mdMin", label: "mdMin", type: ContentType.Number },
    { property: "mdMax", label: "mdMax", type: ContentType.Number },
    { property: "aziRef", label: "aziRef", type: ContentType.String },
    { property: "dTimTrajStart", label: "dTimTrajStart", type: ContentType.Date },
    { property: "dTimTrajEnd", label: "dTimTrajEnd", type: ContentType.Date },
    { property: "uid", label: "UID", type: ContentType.String },
    { property: "dateTimeCreation", label: "Creation date", type: ContentType.Date },
    { property: "dateTimeLastChange", label: "Last changed", type: ContentType.Date }
  ];

  const onSelect = (trajectory: any) => {
    dispatchNavigation({
      type: NavigationType.SelectTrajectory,
      payload: { well: selectedWell, wellbore: selectedWellbore, trajectoryGroup: selectedTrajectoryGroup, trajectory }
    });
  };

  return selectedWellbore ? <ContentTable columns={columns} data={trajectories} onSelect={onSelect} onContextMenu={onContextMenu} /> : <></>;
};

export default TrajectoriesListView;
