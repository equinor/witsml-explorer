import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import Trajectory from "../../models/trajectory";
import TrajectoryStation from "../../models/trajectoryStation";
import ComponentService from "../../services/componentService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import TrajectoryStationContextMenu, { TrajectoryStationContextMenuProps } from "../ContextMenus/TrajectoryStationContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

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
    operationState: { timeZone }
  } = useContext(OperationContext);
  const { selectedServer, selectedObject, servers } = navigationState;
  const [trajectoryStations, setTrajectoryStations] = useState<TrajectoryStation[]>([]);
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

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedTrajectoryStations: TrajectoryStationRow[]) => {
    const contextMenuProps: TrajectoryStationContextMenuProps = {
      checkedTrajectoryStations,
      dispatchNavigation,
      dispatchOperation,
      trajectory: selectedTrajectory,
      selectedServer,
      servers
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TrajectoryStationContextMenu {...contextMenuProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "dTimStn", label: "dTimStn", type: ContentType.DateTime },
    { property: "typeTrajStation", label: "typeTrajStation", type: ContentType.String },
    { property: "md", label: "md", type: ContentType.Number },
    { property: "incl", label: "incl", type: ContentType.Number },
    { property: "azi", label: "azi", type: ContentType.Number },
    { property: "tvd", label: "tvd", type: ContentType.Number }
  ];

  const trajectoryStationRows = trajectoryStations.map((trajectoryStation) => {
    return {
      id: trajectoryStation.uid,
      uid: trajectoryStation.uid,
      dTimStn: formatDateString(trajectoryStation.dTimStn, timeZone),
      typeTrajStation: trajectoryStation.typeTrajStation,
      md: `${trajectoryStation.md.value?.toFixed(4)} ${trajectoryStation.md?.uom}`,
      incl: `${trajectoryStation.incl?.value?.toFixed(4)} ${trajectoryStation.incl?.uom}`,
      azi: `${trajectoryStation.azi?.value?.toFixed(4)} ${trajectoryStation.azi?.uom}`,
      tvd: `${trajectoryStation.tvd?.value?.toFixed(4)} ${trajectoryStation.tvd?.uom}`,
      trajectoryStation: trajectoryStation
    };
  });

  return selectedTrajectory && !isFetchingData ? <ContentTable columns={columns} data={trajectoryStationRows} onContextMenu={onContextMenu} checkableRows /> : <></>;
};

export default TrajectoryView;
