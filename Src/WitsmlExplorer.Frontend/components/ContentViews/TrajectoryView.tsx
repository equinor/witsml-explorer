import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useExpandObjectsGroupNodes } from "../../hooks/useExpandObjectGroupNodes";
import { useGetObjectComponents } from "../../hooks/useGetObjectComponents";
import { ComponentType } from "../../models/componentType";
import { measureToString } from "../../models/measure";
import { ObjectType } from "../../models/objectType";
import Trajectory from "../../models/trajectory";
import TrajectoryStation from "../../models/trajectoryStation";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import TrajectoryStationContextMenu, {
  TrajectoryStationContextMenuProps
} from "../ContextMenus/TrajectoryStationContextMenu";
import formatDateString from "../DateFormatter";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface TrajectoryStationRow extends ContentTableRow {
  uid: string;
  md: number;
  tvd: number;
  incl: number;
  azi: number;
  dTimStn: Date;
  typeTrajStation: string;
  trajectoryStation: TrajectoryStation;
}

export default function TrajectoryView() {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const { selectedServer, selectedObject, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const selectedTrajectory = selectedObject as Trajectory;
  const { wellUid, wellboreUid, objectUid } = useParams();

  const [trajectoryStations, isFetching] =
    useGetObjectComponents<TrajectoryStation>(
      wellUid,
      wellboreUid,
      objectUid,
      ComponentType.TrajectoryStation
    );

  useExpandObjectsGroupNodes(wellUid, wellboreUid, ObjectType.Trajectory);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedTrajectoryStations: TrajectoryStationRow[]
  ) => {
    const contextMenuProps: TrajectoryStationContextMenuProps = {
      checkedTrajectoryStations,
      dispatchNavigation,
      dispatchOperation,
      trajectory: selectedTrajectory,
      selectedServer,
      servers
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <TrajectoryStationContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "dTimStn", label: "dTimStn", type: ContentType.DateTime },
    {
      property: "typeTrajStation",
      label: "typeTrajStation",
      type: ContentType.String
    },
    { property: "md", label: "md", type: ContentType.Number },
    { property: "tvd", label: "tvd", type: ContentType.Number },
    { property: "incl", label: "incl", type: ContentType.Number },
    { property: "azi", label: "azi", type: ContentType.Number },
    { property: "dls", label: "dls", type: ContentType.Number },
    { property: "mtf", label: "mtf", type: ContentType.Number },
    { property: "gtf", label: "gtf", type: ContentType.Number },
    { property: "dispNs", label: "dispNs", type: ContentType.Number },
    { property: "dispEw", label: "dispEw", type: ContentType.Number },
    { property: "vertSect", label: "vertSect", type: ContentType.Number }
  ];

  const trajectoryStationRows = trajectoryStations.map((trajectoryStation) => {
    return {
      id: trajectoryStation.uid,
      uid: trajectoryStation.uid,
      dTimStn: formatDateString(
        trajectoryStation.dTimStn,
        timeZone,
        dateTimeFormat
      ),
      typeTrajStation: trajectoryStation.typeTrajStation,
      md: measureToString(trajectoryStation.md),
      tvd: measureToString(trajectoryStation.tvd),
      incl: measureToString(trajectoryStation.incl),
      azi: measureToString(trajectoryStation.azi),
      dls: measureToString(trajectoryStation.dls),
      mtf: measureToString(trajectoryStation.mtf),
      gtf: measureToString(trajectoryStation.gtf),
      dispNs: measureToString(trajectoryStation.dispNs),
      dispEw: measureToString(trajectoryStation.dispEw),
      vertSect: measureToString(trajectoryStation.vertSect),
      trajectoryStation: trajectoryStation
    };
  });

  return (
    !isFetching && (
      <ContentTable
        viewId="trajectoryView"
        columns={columns}
        data={trajectoryStationRows}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        // TODO: Fix downloadToCsvFilename, selectedTrajectory.name has been removed.
        // downloadToCsvFileName={`Trajectory_${selectedTrajectory.name}`}
        downloadToCsvFileName={`Trajectory_${objectUid}`}
      />
    )
  );
}
