import React, { ReactElement, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import NavigationContext, { selectedJobsFlag, selectedServerManagerFlag } from "../contexts/navigationContext";
import { ObjectType } from "../models/objectType";
import { BhaRunsListView } from "./ContentViews/BhaRunsListView";
import ChangeLogsListView from "./ContentViews/ChangeLogsListView";
import { CurveValuesView } from "./ContentViews/CurveValuesView";
import FormationMarkersListView from "./ContentViews/FormationMarkersListView";
import JobsView from "./ContentViews/JobsView";
import LogCurveInfoListView from "./ContentViews/LogCurveInfoListView";
import { LogTypeListView } from "./ContentViews/LogTypeListView";
import { LogsListView } from "./ContentViews/LogsListView";
import { MessagesListView } from "./ContentViews/MessagesListView";
import MudLogView from "./ContentViews/MudLogView";
import { MudLogsListView } from "./ContentViews/MudLogsListView";
import { RigsListView } from "./ContentViews/RigsListView";
import { RisksListView } from "./ContentViews/RisksListView";
import ServerManager from "./ContentViews/ServerManager";
import TrajectoriesListView from "./ContentViews/TrajectoriesListView";
import TrajectoryView from "./ContentViews/TrajectoryView";
import TubularView from "./ContentViews/TubularView";
import TubularsListView from "./ContentViews/TubularsListView";
import WbGeometryView from "./ContentViews/WbGeometryView";
import { WbGeometrysListView } from "./ContentViews/WbGeometrysListView";
import WellboreObjectTypesListView from "./ContentViews/WellboreObjectTypesListView";
import { WellboresListView } from "./ContentViews/WellboresListView";
import { WellsListView } from "./ContentViews/WellsListView";

const objectGroupViews: Record<ObjectType, ReactElement> = {
  [ObjectType.BhaRun]: <BhaRunsListView />,
  [ObjectType.ChangeLog]: <ChangeLogsListView />,
  [ObjectType.FormationMarker]: <FormationMarkersListView />,
  [ObjectType.Log]: <LogTypeListView />,
  [ObjectType.Message]: <MessagesListView />,
  [ObjectType.MudLog]: <MudLogsListView />,
  [ObjectType.Rig]: <RigsListView />,
  [ObjectType.Risk]: <RisksListView />,
  [ObjectType.Trajectory]: <TrajectoriesListView />,
  [ObjectType.Tubular]: <TubularsListView />,
  [ObjectType.WbGeometry]: <WbGeometrysListView />
};

const ContentView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore, selectedLogTypeGroup, selectedLogCurveInfo, selectedObjectGroup, selectedObject, selectedServer, currentSelected } = navigationState;
  const [view, setView] = useState(<WellsListView />);

  useEffect(() => {
    const setObjectGroupView = () => {
      const groupView = objectGroupViews[currentSelected as ObjectType];
      if (groupView != null) {
        setView(groupView);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Don't know how to render this item: ${JSON.stringify(currentSelected)}`);
        setView(undefined);
      }
    };

    const setObjectView = () => {
      if (selectedObjectGroup === ObjectType.Log) {
        setView(<LogCurveInfoListView />);
      } else if (selectedObjectGroup === ObjectType.MudLog) {
        setView(<MudLogView />);
      } else if (selectedObjectGroup === ObjectType.Trajectory) {
        setView(<TrajectoryView />);
      } else if (selectedObjectGroup === ObjectType.Tubular) {
        setView(<TubularView />);
      } else if (selectedObjectGroup === ObjectType.WbGeometry) {
        setView(<WbGeometryView />);
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
      } else if (currentSelected === selectedObject) {
        setObjectView();
      } else if (currentSelected === selectedLogCurveInfo) {
        setView(<CurveValuesView />);
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
