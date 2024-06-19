import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { useConnectedServer } from "../../contexts/connectedServerContext";
import { useGetObjects } from "../../hooks/query/useGetObjects";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { ObjectType, pluralizeObjectType } from "../../models/objectType";
import { ItemNotFound } from "../../routes/ItemNotFound";
import { ProgressSpinnerOverlay } from "../ProgressSpinner";
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
  BhaRun = "BhaRun",
  ChangeLog = "ChangeLog",
  FluidsReport = "FluidsReport",
  FormationMarker = "FormationMarker",
  Message = "Message",
  MudLog = "MudLog",
  Rig = "Rig",
  Risk = "Risk",
  Trajectory = "Trajectory",
  Tubular = "Tubular",
  WbGeometry = "WbGeometry"
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
  const { objectGroup, wellUid, wellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { wellbore, isFetched: isFetchedWellbore } = useGetWellbore(
    connectedServer,
    wellUid,
    wellboreUid
  );
  const { isFetching } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    objectGroup as ObjectType
  );

  if (isFetchedWellbore && !wellbore) {
    return (
      <ItemNotFound itemType={pluralizeObjectType(objectGroup as ObjectType)} />
    );
  }

  return (
    <>
      {isFetching && (
        <ProgressSpinnerOverlay
          message={`Fetching ${pluralizeObjectType(objectGroup as ObjectType)}`}
        />
      )}
      {getObjectListView(objectGroup)}
    </>
  );
}

const getObjectListView = (objectType: string) => {
  const view = objectGroupViews[objectType as ObjectGroupUrlParams];
  if (!view) {
    throw new Error(
      `No group view is implemented for item: ${JSON.stringify(objectType)}`
    );
  }
  return view;
};
