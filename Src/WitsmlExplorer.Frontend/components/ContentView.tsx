import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { WellsListView } from "./ContentViews/WellsListView";
import { WellboresListView } from "./ContentViews/WellboresListView";
import { LogTypeListView } from "./ContentViews/LogTypeListView";
import { LogsListView } from "./ContentViews/LogsListView";
import { RigsListView } from "./ContentViews/RigsListView";
import { MessagesListView } from "./ContentViews/MessagesListView";
import WellboreObjectTypesListView from "./ContentViews/WellboreObjectTypesListView";
import TrajectoriesListView from "./ContentViews/TrajectoriesListView";
import LogCurveInfoListView from "./ContentViews/LogCurveInfoListView";
import TrajectoryView from "./ContentViews/TrajectoryView";
import NavigationContext from "../contexts/navigationContext";
import { CurveValuesView } from "./ContentViews/CurveValuesView";

const ContentView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    selectedWell,
    selectedWellbore,
    selectedLogGroup,
    selectedLogTypeGroup,
    selectedLog,
    selectedLogCurveInfo,
    selectedRigGroup,
    selectedMessageGroup,
    selectedTrajectoryGroup,
    selectedTrajectory,
    selectedServer,
    currentSelected
  } = navigationState;
  const [view, setView] = useState(<WellsListView />);

  useEffect(() => {
    if (currentSelected === null) {
      setView(<></>);
    } else {
      if (currentSelected === selectedServer) {
        setView(<WellsListView />);
      } else if (currentSelected === selectedWell) {
        setView(<WellboresListView />);
      } else if (currentSelected === selectedWellbore) {
        setView(<WellboreObjectTypesListView />);
      } else if (currentSelected === selectedLogGroup) {
        setView(<LogTypeListView />);
      } else if (currentSelected === selectedLogTypeGroup) {
        setView(<LogsListView />);
      } else if (currentSelected === selectedLog) {
        setView(<LogCurveInfoListView />);
      } else if (currentSelected === selectedRigGroup) {
        setView(<RigsListView />);
      } else if (currentSelected === selectedMessageGroup) {
        setView(<MessagesListView />);
      } else if (currentSelected === selectedLogCurveInfo) {
        setView(<CurveValuesView />);
      } else if (currentSelected === selectedTrajectoryGroup) {
        setView(<TrajectoriesListView />);
      } else if (currentSelected === selectedTrajectory) {
        setView(<TrajectoryView />);
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
