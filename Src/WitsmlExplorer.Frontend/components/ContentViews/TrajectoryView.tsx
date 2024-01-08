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
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";
import { measureToString } from "models/measure";
import Trajectory from "models/trajectory";
import TrajectoryStation from "models/trajectoryStation";
import React, { useContext, useEffect, useState } from "react";
import ComponentService from "services/componentService";

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

export const TrajectoryView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const { selectedServer, selectedObject, servers } = navigationState;
  const [trajectoryStations, setTrajectoryStations] = useState<
    TrajectoryStation[]
  >([]);
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const selectedTrajectory = selectedObject as Trajectory;

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedTrajectory) {
      const abortController = new AbortController();

      const getTrajectory = async () => {
        setTrajectoryStations(
          await ComponentService.getComponents(
            selectedTrajectory.wellUid,
            selectedTrajectory.wellboreUid,
            selectedTrajectory.uid,
            ComponentType.TrajectoryStation,
            undefined,
            abortController.signal
          )
        );
        setIsFetchingData(false);
      };

      getTrajectory();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedTrajectory]);

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

  return selectedTrajectory && !isFetchingData ? (
    <ContentTable
      viewId="trajectoryView"
      columns={columns}
      data={trajectoryStationRows}
      onContextMenu={onContextMenu}
      checkableRows
      showRefresh
      downloadToCsvFileName={`Trajectory_${selectedTrajectory.name}`}
    />
  ) : (
    <></>
  );
};

export default TrajectoryView;
