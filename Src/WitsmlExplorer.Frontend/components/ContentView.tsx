import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import NavigationContext, { selectedJobsFlag, selectedServerManagerFlag } from "../contexts/navigationContext";
import { ObjectType } from "../models/objectType";
import { BhaRunsListView } from "./ContentViews/BhaRunsListView";
import ChangeLogsListView from "./ContentViews/ChangeLogsListView";
import { CurveValuesView } from "./ContentViews/CurveValuesView";
import FormationMarkersListView from "./ContentViews/FormationMarkersListView";
import JobsView from "./ContentViews/JobsView";
import LogCurveInfoListView from "./ContentViews/LogCurveInfoListView";
import { LogsListView } from "./ContentViews/LogsListView";
import { LogTypeListView } from "./ContentViews/LogTypeListView";
import { MessagesListView } from "./ContentViews/MessagesListView";
import { MudLogsListView } from "./ContentViews/MudLogsListView";
import MudLogView from "./ContentViews/MudLogView";
import { RigsListView } from "./ContentViews/RigsListView";
import { RisksListView } from "./ContentViews/RisksListView";
import ServerManager from "./ContentViews/ServerManager";
import TrajectoriesListView from "./ContentViews/TrajectoriesListView";
import TrajectoryView from "./ContentViews/TrajectoryView";
import TubularsListView from "./ContentViews/TubularsListView";
import TubularView from "./ContentViews/TubularView";
import { WbGeometrysListView } from "./ContentViews/WbGeometrysListView";
import WbGeometryView from "./ContentViews/WbGeometryView";
import WellboreObjectTypesListView from "./ContentViews/WellboreObjectTypesListView";
import { WellboresListView } from "./ContentViews/WellboresListView";
import { WellsListView } from "./ContentViews/WellsListView";

const ContentView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    selectedWell,
    selectedWellbore,
    selectedLogTypeGroup,
    selectedLog,
    selectedLogCurveInfo,
    selectedMudLog,
    selectedObjectGroup,
    selectedTrajectory,
    selectedTubular,
    selectedWbGeometry,
    selectedServer,
    currentSelected
  } = navigationState;
  const [view, setView] = useState(<WellsListView />);

  useEffect(() => {
    const setObjectGroupView = () => {
      if (currentSelected === ObjectType.BhaRun) {
        setView(<BhaRunsListView />);
      } else if (currentSelected === ObjectType.ChangeLog) {
        setView(<ChangeLogsListView />);
      } else if (currentSelected === ObjectType.FormationMarker) {
        setView(<FormationMarkersListView />);
      } else if (currentSelected === ObjectType.Log) {
        setView(<LogTypeListView />);
      } else if (currentSelected === ObjectType.Message) {
        setView(<MessagesListView />);
      } else if (currentSelected === ObjectType.MudLog) {
        setView(<MudLogsListView />);
      } else if (currentSelected === ObjectType.Rig) {
        setView(<RigsListView />);
      } else if (currentSelected === ObjectType.Risk) {
        setView(<RisksListView />);
      } else if (currentSelected === ObjectType.Trajectory) {
        setView(<TrajectoriesListView />);
      } else if (currentSelected === ObjectType.Tubular) {
        setView(<TubularsListView />);
      } else if (currentSelected === ObjectType.WbGeometry) {
        setView(<WbGeometrysListView />);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Don't know how to render this item: ${JSON.stringify(currentSelected)}`);
        setView(undefined);
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
        setObjectGroupView();
      } else if (currentSelected === selectedLogTypeGroup) {
        setView(<LogsListView />);
      } else if (currentSelected === selectedLog) {
        setView(<LogCurveInfoListView />);
      } else if (currentSelected == selectedMudLog) {
        setView(<MudLogView />);
      } else if (currentSelected === selectedLogCurveInfo) {
        setView(<CurveValuesView />);
      } else if (currentSelected === selectedTrajectory) {
        setView(<TrajectoryView />);
      } else if (currentSelected === selectedTubular) {
        setView(<TubularView />);
      } else if (currentSelected === selectedWbGeometry) {
        setView(<WbGeometryView />);
      } else if (currentSelected === selectedJobsFlag) {
        setView(<JobsView />);
      } else if (currentSelected === selectedServerManagerFlag) {
        setView(<ServerManager />);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Don't know how to render this item: ${JSON.stringify(currentSelected)}`);
        setView(undefined);
      }
    }
  }, [currentSelected]);

  return <>{view && <ContentPanel>{view}</ContentPanel>}</>;
};

const ContentPanel = styled.div`
  height: 100%;
`;

export default ContentView;
