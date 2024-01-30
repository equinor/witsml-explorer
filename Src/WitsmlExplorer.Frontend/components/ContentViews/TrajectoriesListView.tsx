import { MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useExpandObjectsGroupNodes } from "../../hooks/useExpandObjectGroupNodes";
import { useGetObjects } from "../../hooks/useGetObjects";
import { measureToString } from "../../models/measure";
import { ObjectType } from "../../models/objectType";
import Trajectory from "../../models/trajectory";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import TrajectoryContextMenu from "../ContextMenus/TrajectoryContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export default function TrajectoriesListView() {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { wellUid, wellboreUid } = useParams();

  const trajectories = useGetObjects(
    wellUid,
    wellboreUid,
    ObjectType.Trajectory
  ) as Trajectory[];

  useExpandObjectsGroupNodes(wellUid, wellboreUid, ObjectType.Trajectory);

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
    navigate(
      `/servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${
        ObjectType.Trajectory
      }/objects/${trajectory.uid}`
    );
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
