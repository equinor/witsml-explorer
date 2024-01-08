import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TrajectoryContextMenu from "components/ContextMenus/TrajectoryContextMenu";
import formatDateString from "components/DateFormatter";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import Trajectory from "models/trajectory";
import React, { useContext, useEffect, useState } from "react";

export const TrajectoriesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWell, selectedWellbore } = navigationState;
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);

  useEffect(() => {
    if (selectedWellbore?.trajectories) {
      setTrajectories(selectedWellbore.trajectories);
    }
  }, [selectedWellbore?.trajectories]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    selectedTrajectories: Trajectory[]
  ) => {
    const unchangedSelectedTrajectories = trajectories.filter((trajectory) =>
      selectedTrajectories.some(
        (selectedTrajectory) => selectedTrajectory.uid === trajectory.uid
      )
    );
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: unchangedSelectedTrajectories,
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <TrajectoryContextMenu {...contextProps} />,
        position
      }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "mdMin", label: "mdMin", type: ContentType.Number },
    { property: "mdMax", label: "mdMax", type: ContentType.Number },
    { property: "aziRef", label: "aziRef", type: ContentType.String },
    {
      property: "dTimTrajStart",
      label: "dTimTrajStart",
      type: ContentType.DateTime
    },
    {
      property: "dTimTrajEnd",
      label: "dTimTrajEnd",
      type: ContentType.DateTime
    },
    {
      property: "serviceCompany",
      label: "serviceCompany",
      type: ContentType.String
    },
    { property: "uid", label: "uid", type: ContentType.String },
    {
      property: "sourceName",
      label: "commonData.sourceName",
      type: ContentType.String
    },
    {
      property: "dateTimeCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dateTimeLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    }
  ];

  const onSelect = (trajectory: any) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: {
        well: selectedWell,
        wellbore: selectedWellbore,
        object: trajectory,
        objectType: ObjectType.Trajectory
      }
    });
  };

  const trajectoryRows = trajectories.map((trajectory) => {
    return {
      ...trajectory,
      ...trajectory.commonData,
      dTimTrajStart: formatDateString(
        trajectory.dTimTrajStart,
        timeZone,
        dateTimeFormat
      ),
      dTimTrajEnd: formatDateString(
        trajectory.dTimTrajEnd,
        timeZone,
        dateTimeFormat
      ),
      dateTimeCreation: formatDateString(
        trajectory.commonData.dTimCreation,
        timeZone,
        dateTimeFormat
      ),
      dateTimeLastChange: formatDateString(
        trajectory.commonData.dTimLastChange,
        timeZone,
        dateTimeFormat
      ),
      mdMin: measureToString(trajectory.mdMin),
      mdMax: measureToString(trajectory.mdMax),
      id: trajectory.uid
    };
  });

  return selectedWellbore && trajectories == selectedWellbore.trajectories ? (
    <ContentTable
      viewId="trajectoriesListView"
      columns={columns}
      data={trajectoryRows}
      onSelect={onSelect}
      onContextMenu={onContextMenu}
      checkableRows
      showRefresh
      downloadToCsvFileName="Trajectories"
    />
  ) : (
    <></>
  );
};

export default TrajectoriesListView;
