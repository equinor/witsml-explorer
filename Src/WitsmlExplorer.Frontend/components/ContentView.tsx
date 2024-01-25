import { BhaRunsListView } from "components/ContentViews/BhaRunsListView";
import ChangeLogsListView from "components/ContentViews/ChangeLogsListView";
import { CurveValuesView } from "components/ContentViews/CurveValuesView";
import FluidsReportsListView from "components/ContentViews/FluidsReportListView";
import FluidsView from "components/ContentViews/FluidsView";
import FormationMarkersListView from "components/ContentViews/FormationMarkersListView";
import JobsView from "components/ContentViews/JobsView";
import LogCurveInfoListView from "components/ContentViews/LogCurveInfoListView";
import { LogTypeListView } from "components/ContentViews/LogTypeListView";
import LogsListView from "components/ContentViews/LogsListView";
import { MessagesListView } from "components/ContentViews/MessagesListView";
import MudLogView from "components/ContentViews/MudLogView";
import { MudLogsListView } from "components/ContentViews/MudLogsListView";
import ObjectSearchListView from "components/ContentViews/ObjectSearchListView";
import QueryView from "components/ContentViews/QueryView";
import { RigsListView } from "components/ContentViews/RigsListView";
import { RisksListView } from "components/ContentViews/RisksListView";
import ServerManager from "components/ContentViews/ServerManager";
import TrajectoriesListView from "components/ContentViews/TrajectoriesListView";
import TrajectoryView from "components/ContentViews/TrajectoryView";
import TubularView from "components/ContentViews/TubularView";
import TubularsListView from "components/ContentViews/TubularsListView";
import { WbGeometriesListView } from "components/ContentViews/WbGeometriesListView";
import WbGeometryView from "components/ContentViews/WbGeometryView";
import WellboreObjectTypesListView from "components/ContentViews/WellboreObjectTypesListView";
import { WellboresListView } from "components/ContentViews/WellboresListView";
import { WellsListView } from "components/ContentViews/WellsListView";
import NavigationContext, { ViewFlags } from "contexts/navigationContext";
import { ObjectType } from "models/objectType";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import styled from "styled-components";

const objectGroupViews: Record<ObjectType, ReactElement> = {
  [ObjectType.BhaRun]: <BhaRunsListView />,
  [ObjectType.ChangeLog]: <ChangeLogsListView />,
  [ObjectType.FluidsReport]: <FluidsReportsListView />,
  [ObjectType.FormationMarker]: <FormationMarkersListView />,
  [ObjectType.Log]: <LogTypeListView />,
  [ObjectType.Message]: <MessagesListView />,
  [ObjectType.MudLog]: <MudLogsListView />,
  [ObjectType.Rig]: <RigsListView />,
  [ObjectType.Risk]: <RisksListView />,
  [ObjectType.Trajectory]: <TrajectoriesListView />,
  [ObjectType.Tubular]: <TubularsListView />,
  [ObjectType.WbGeometry]: <WbGeometriesListView />
};

const objectViews: Partial<Record<ObjectType, ReactElement>> = {
  [ObjectType.Log]: <LogCurveInfoListView />,
  [ObjectType.MudLog]: <MudLogView />,
  [ObjectType.Trajectory]: <TrajectoryView />,
  [ObjectType.Tubular]: <TubularView />,
  [ObjectType.WbGeometry]: <WbGeometryView />,
  [ObjectType.FluidsReport]: <FluidsView />
};

const ContentView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    selectedWell,
    selectedWellbore,
    selectedLogTypeGroup,
    selectedLogCurveInfo,
    selectedObjectGroup,
    selectedObject,
    selectedServer,
    currentSelected
  } = navigationState;
  const [view, setView] = useState(<WellsListView />);

  useEffect(() => {
    const setObjectView = (isGroup: boolean): void => {
      const views = isGroup ? objectGroupViews : objectViews;
      const view = views[selectedObjectGroup as ObjectType];
      if (view != null) {
        setView(view);
      } else {
        throw new Error(
          `No ${
            isGroup ? "group" : "object"
          } view is implemented for item: ${JSON.stringify(
            selectedObjectGroup
          )}`
        );
      }
    };

    if (currentSelected === null) {
      setView(<ServerManager />);
    } else {
      if (currentSelected === selectedServer) {
        setView(<WellsListView />);
      } else if (currentSelected === selectedWell) {
        setView(<WellboresListView />);
      } else if (currentSelected === selectedWellbore) {
        setView(<WellboreObjectTypesListView />);
      } else if (currentSelected === selectedObjectGroup) {
        setObjectView(true);
      } else if (currentSelected === selectedLogTypeGroup) {
        setView(<LogsListView />);
      } else if (currentSelected === selectedObject) {
        setObjectView(false);
      } else if (currentSelected === selectedLogCurveInfo) {
        setView(<CurveValuesView />);
      } else if (currentSelected === ViewFlags.Jobs) {
        setView(<JobsView />);
      } else if (currentSelected === ViewFlags.Query) {
        setView(<QueryView />);
      } else if (currentSelected === ViewFlags.ServerManager) {
        setView(<ServerManager />);
      } else if (currentSelected === ViewFlags.ObjectSearchView) {
        setView(<ObjectSearchListView />);
      } else {
        throw new Error(
          `No view is implemented for item: ${JSON.stringify(currentSelected)}`
        );
      }
    }
  }, [currentSelected]);

  return <>{view && <ContentPanel>{view}</ContentPanel>}</>;
};

const ContentPanel = styled.div`
  height: 100%;
`;

export default ContentView;
