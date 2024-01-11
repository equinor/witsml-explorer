import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import BhaRunsListView from "./BhaRunsListView";
import ChangeLogsListView from "./ChangeLogsListView";
import FluidsReportsListView from "./FluidsReportListView";
import FormationMarkersListView from "./FormationMarkersListView";
import MessagesListView from "./MessagesListView";
import MudLogsListView from "./MudLogsListView";
import RigsListView from "./RigsListView";
import RisksListView from "./RisksListView";
import TrajectoriesListView from "./TrajectoriesListView";
import TubularsListView from "./TubularsListView";
import WbGeometriesListView from "./WbGeometriesListView";

enum ObjectGroupUrlParams {
  BhaRun = "bharuns",
  ChangeLog = "changelogs",
  FluidsReport = "fluidsreports",
  FormationMarker = "formationmarkers",
  Message = "messages",
  MudLog = "mudlogs",
  Rig = "rigs",
  Risk = "risks",
  Trajectory = "trajectories",
  Tubular = "tubulars",
  WbGeometry = "wbgeometries"
}

const objectGroupViews: Record<ObjectGroupUrlParams, ReactElement> = {
  [ObjectGroupUrlParams.BhaRun]: <BhaRunsListView />,
  [ObjectGroupUrlParams.ChangeLog]: <ChangeLogsListView />,
  [ObjectGroupUrlParams.FluidsReport]: <FluidsReportsListView />,
  [ObjectGroupUrlParams.FormationMarker]: <FormationMarkersListView />,
  [ObjectGroupUrlParams.Message]: <MessagesListView />,
  [ObjectGroupUrlParams.MudLog]: <MudLogsListView />,
  [ObjectGroupUrlParams.Rig]: <RigsListView />,
  [ObjectGroupUrlParams.Risk]: <RisksListView />,
  [ObjectGroupUrlParams.Trajectory]: <TrajectoriesListView />,
  [ObjectGroupUrlParams.Tubular]: <TubularsListView />,
  [ObjectGroupUrlParams.WbGeometry]: <WbGeometriesListView />
};

export function ObjectsListView() {
  const { objectGroup } = useParams();

  const getObjectListView = (objectType: string) => {
    const view = objectGroupViews[objectType as ObjectGroupUrlParams];
    if (!view) {
      throw new Error(
        `No group view is implemented for item: ${JSON.stringify(objectType)}`
      );
    }
    return view;
  };

  return getObjectListView(objectGroup);
}
