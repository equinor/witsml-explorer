import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TrajectoryContextMenu from "components/ContextMenus/TrajectoryContextMenu";
import formatDateString from "components/DateFormatter";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import Trajectory from "models/trajectory";
import { MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getObjectViewPath } from "routes/utils/pathBuilder";

export default function TrajectoriesListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const { wellUid, wellboreUid } = useParams();
  const { objects: trajectories } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Trajectory
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Trajectory);

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    selectedTrajectories: Trajectory[]
  ) => {
    const unchangedSelectedTrajectories = trajectories.filter((trajectory) =>
      selectedTrajectories.some(
        (selectedTrajectory) => selectedTrajectory.uid === trajectory.uid
      )
    );
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: unchangedSelectedTrajectories
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
    },
    {
      property: "itemState",
      label: "commonData.ItemState",
      type: ContentType.String
    }
  ];

  const onSelect = (trajectory: any) => {
    navigate(
      getObjectViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        ObjectType.Trajectory,
        trajectory.uid
      )
    );
  };

  const trajectoryRows = trajectories?.map((trajectory) => {
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
      id: trajectory.uid,
      itemState: trajectory.commonData?.itemState
    };
  });

  return (
    trajectories && (
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
    )
  );
}
