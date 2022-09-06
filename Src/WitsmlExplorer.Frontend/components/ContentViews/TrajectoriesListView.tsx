import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import Trajectory from "../../models/trajectory";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import TrajectoryContextMenu, { TrajectoryContextMenuProps } from "../ContextMenus/TrajectoryContextMenu";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const TrajectoriesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, selectedWell, selectedWellbore, selectedTrajectoryGroup, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);

  useEffect(() => {
    if (selectedWellbore?.trajectories) {
      setTrajectories(selectedWellbore.trajectories);
    }
  }, [selectedWellbore?.trajectories]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, trajectories: Trajectory[]) => {
    const contextProps: TrajectoryContextMenuProps = { dispatchOperation, selectedServer, trajectories, servers, wellbore: selectedWellbore };
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

  const trajectoryRows = trajectories.map((trajectory) => {
    return {
      ...trajectory,
      id: trajectory.uid
    };
  });

  return selectedWellbore && trajectories == selectedWellbore.trajectories ? (
    <ContentTable columns={columns} data={trajectoryRows} onSelect={onSelect} onContextMenu={onContextMenu} checkableRows />
  ) : (
    <></>
  );
};

export default TrajectoriesListView;
