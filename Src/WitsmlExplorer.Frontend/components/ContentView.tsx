import React, { ReactElement, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import NavigationContext, { ViewFlags } from "../contexts/navigationContext";
import { ObjectType } from "../models/objectType";
import { BhaRunsListView } from "./ContentViews/BhaRunsListView";
import ChangeLogsListView from "./ContentViews/ChangeLogsListView";
import { CurveValuesView } from "./ContentViews/CurveValuesView";
import FluidsReportsListView from "./ContentViews/FluidsReportListView";
import FluidsView from "./ContentViews/FluidsView";
import FormationMarkersListView from "./ContentViews/FormationMarkersListView";
import JobsView from "./ContentViews/JobsView";
import LogCurveInfoListView from "./ContentViews/LogCurveInfoListView";
import { LogTypeListView } from "./ContentViews/LogTypeListView";
import LogsListView from "./ContentViews/LogsListView";
import { MessagesListView } from "./ContentViews/MessagesListView";
import MudLogView from "./ContentViews/MudLogView";
import { MudLogsListView } from "./ContentViews/MudLogsListView";
import ObjectSearchListView from "./ContentViews/ObjectSearchListView";
import QueryView from "./ContentViews/QueryView";
import { RigsListView } from "./ContentViews/RigsListView";
import { RisksListView } from "./ContentViews/RisksListView";
import ServerManager from "./ContentViews/ServerManager";
import TrajectoriesListView from "./ContentViews/TrajectoriesListView";
import TrajectoryView from "./ContentViews/TrajectoryView";
import TubularView from "./ContentViews/TubularView";
import TubularsListView from "./ContentViews/TubularsListView";
import { WbGeometriesListView } from "./ContentViews/WbGeometriesListView";
import WbGeometryView from "./ContentViews/WbGeometryView";
import WellboreObjectTypesListView from "./ContentViews/WellboreObjectTypesListView";
import { WellboresListView } from "./ContentViews/WellboresListView";
import { WellsListView } from "./ContentViews/WellsListView";
import GelogicalIntervalView from "./ContentViews/GelogicalIntervalView";

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
  [ObjectType.WbGeometry]: <WbGeometriesListView />,
  [ObjectType.geologyInterval]: <MudLogsListView />
};

const objectViews: Partial<Record<ObjectType, ReactElement>> = {
  [ObjectType.Log]: <LogCurveInfoListView />,
  [ObjectType.MudLog]: <MudLogView />,
  [ObjectType.Trajectory]: <TrajectoryView />,
  [ObjectType.Tubular]: <TubularView />,
  [ObjectType.WbGeometry]: <WbGeometryView />,
  [ObjectType.FluidsReport]: <FluidsView />,
  [ObjectType.geologyInterval]: <GelogicalIntervalView />
};

const ContentView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore, selectedLogTypeGroup, selectedLogCurveInfo, selectedObjectGroup, selectedObject, selectedServer, currentSelected } = navigationState;
  const [view, setView] = useState(<WellsListView />);

  useEffect(() => {
    const setObjectView = (isGroup: boolean): void => {
      const views = isGroup ? objectGroupViews : objectViews;
      const view = views[selectedObjectGroup as ObjectType];
      if (view != null) {
        setView(view);
      } else {
        throw new Error(`No ${isGroup ? "group" : "object"} view is implemented for item: ${JSON.stringify(selectedObjectGroup)}`);
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
        if (selectedObjectGroup === ObjectType.geologyInterval) {
          setView(<GelogicalIntervalView />);
        } else setObjectView(true);
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
        throw new Error(`No view is implemented for item: ${JSON.stringify(currentSelected)}`);
      }
    }
  }, [currentSelected]);

  return <>{view && <ContentPanel>{view}</ContentPanel>}</>;
};

const ContentPanel = styled.div`
  height: 100%;
`;

export default ContentView;
