import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import Trajectory from "../../models/trajectory";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import TrajectoryContextMenu from "../ContextMenus/TrajectoryContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const TrajectoriesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWell, selectedWellbore } = navigationState;
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);

  useEffect(() => {
    if (selectedWellbore?.trajectories) {
      setTrajectories(selectedWellbore.trajectories);
    }
  }, [selectedWellbore?.trajectories]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, trajectories: Trajectory[]) => {
    const contextProps: ObjectContextMenuProps = { checkedObjects: trajectories, wellbore: selectedWellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TrajectoryContextMenu {...contextProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "mdMin", label: "mdMin", type: ContentType.Number },
    { property: "mdMax", label: "mdMax", type: ContentType.Number },
    { property: "aziRef", label: "aziRef", type: ContentType.String },
    { property: "dTimTrajStart", label: "dTimTrajStart", type: ContentType.DateTime },
    { property: "dTimTrajEnd", label: "dTimTrajEnd", type: ContentType.DateTime },
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "dateTimeCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
    { property: "dateTimeLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime }
  ];

  const onSelect = (trajectory: any) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: { well: selectedWell, wellbore: selectedWellbore, object: trajectory, objectType: ObjectType.Trajectory }
    });
  };

  const trajectoryRows = trajectories.map((trajectory) => {
    return {
      ...trajectory,
      dTimTrajStart: formatDateString(trajectory.dTimTrajStart, timeZone),
      dTimTrajEnd: formatDateString(trajectory.dTimTrajEnd, timeZone),
      dateTimeCreation: formatDateString(trajectory.dateTimeCreation, timeZone),
      dateTimeLastChange: formatDateString(trajectory.dateTimeLastChange, timeZone),
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
