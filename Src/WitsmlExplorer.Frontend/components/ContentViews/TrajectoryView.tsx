import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import TrajectoryStationContextMenu, {
  TrajectoryStationContextMenuProps
} from "components/ContextMenus/TrajectoryStationContextMenu";
import formatDateString from "components/DateFormatter";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import TrajectoryStation from "models/trajectoryStation";
import React from "react";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";

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
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useOperationState();
  const { dispatchOperation } = useOperationState();
  const { wellUid, wellboreUid, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { object: trajectory, isFetched: isFetchedTrajectory } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Trajectory,
    objectUid
  );

  const { components: trajectoryStations, isFetching } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.TrajectoryStation,
    { placeholderData: [] }
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Trajectory);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedTrajectoryStations: TrajectoryStationRow[]
  ) => {
    const contextMenuProps: TrajectoryStationContextMenuProps = {
      checkedTrajectoryStations,
      trajectory
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

  if (isFetchedTrajectory && !trajectory) {
    return <ItemNotFound itemType={ObjectType.Trajectory} />;
  }

  return (
    <>
      {isFetching && <ProgressSpinnerOverlay message="Fetching Trajectory." />}
      <ContentTable
        viewId="trajectoryView"
        columns={columns}
        data={trajectoryStationRows}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName={`Trajectory_${trajectory?.name}`}
      />
    </>
  );
}
