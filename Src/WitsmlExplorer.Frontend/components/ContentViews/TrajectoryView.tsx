import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType, ContentTableRow } from "./table";
import TrajectoryService from "../../services/trajectoryService";
import TrajectoryStation from "../../models/trajectoryStation";
import NavigationContext from "../../contexts/navigationContext";

export interface TrajectoryStationRow extends ContentTableRow {
  uid: string;
  md: number;
  tvd: number;
  incl: number;
  azi: number;
  dTimStn: Date;
  typeTrajStation: string;
  TrajectoryStation: TrajectoryStation;
}

export const TrajectoryView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedTrajectory } = navigationState;
  const [trajectoryStations, setTrajectoryStations] = useState<TrajectoryStation[]>([]);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedTrajectory) {
      const abortController = new AbortController();

      const getTrajectory = async () => {
        setTrajectoryStations(
          await TrajectoryService.getTrajectoryStations(selectedTrajectory.wellUid, selectedTrajectory.wellboreUid, selectedTrajectory.uid, abortController.signal)
        );
        setIsFetchingData(false);
      };

      getTrajectory();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedTrajectory]);

  const columns: ContentTableColumn[] = [
    { property: "uid", label: "Uid", type: ContentType.String },
    { property: "dTimStn", label: "dTimStn", type: ContentType.DateTime },
    { property: "typeTrajStation", label: "typeTrajStation", type: ContentType.String },
    { property: "md", label: "md", type: ContentType.Number },
    { property: "incl", label: "incl", type: ContentType.Number },
    { property: "azi", label: "azi", type: ContentType.Number },
    { property: "tvd", label: "tvd", type: ContentType.Number }
  ];

  const trajectoryStationRows = trajectoryStations.map((trajectoryStation) => {
    return {
      uid: trajectoryStation.uid,
      dTimStn: trajectoryStation.dTimStn,
      typeTrajStation: trajectoryStation.typeTrajStation,
      md: trajectoryStation.md,
      incl: trajectoryStation.incl,
      azi: trajectoryStation.azi,
      tvd: trajectoryStation.tvd
    };
  });

  return selectedTrajectory && !isFetchingData ? <ContentTable columns={columns} data={trajectoryStationRows} /> : <></>;
};

export default TrajectoryView;
