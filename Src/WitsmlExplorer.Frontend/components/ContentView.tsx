import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import NavigationContext, { listWellsFlag, selectedJobsFlag, selectedManageServerFlag } from "../contexts/navigationContext";
import OperationContext from "../contexts/operationContext";
import { emptyServer, Server } from "../models/server";
import { BhaRunsListView } from "./ContentViews/BhaRunsListView";
import { CurveValuesView } from "./ContentViews/CurveValuesView";
import JobsView from "./ContentViews/JobsView";
import LogCurveInfoListView from "./ContentViews/LogCurveInfoListView";
import { LogsListView } from "./ContentViews/LogsListView";
import { LogTypeListView } from "./ContentViews/LogTypeListView";
import { MessagesListView } from "./ContentViews/MessagesListView";
import { RigsListView } from "./ContentViews/RigsListView";
import { RisksListView } from "./ContentViews/RisksListView";
import TrajectoriesListView from "./ContentViews/TrajectoriesListView";
import TrajectoryView from "./ContentViews/TrajectoryView";
import TubularsListView from "./ContentViews/TubularsListView";
import TubularView from "./ContentViews/TubularView";
import { WbGeometrysListView } from "./ContentViews/WbGeometrysListView";
import WbGeometryView from "./ContentViews/WbGeometryView";
import WellboreObjectTypesListView from "./ContentViews/WellboreObjectTypesListView";
import { WellboresListView } from "./ContentViews/WellboresListView";
import { WellsListView } from "./ContentViews/WellsListView";
import ServerModal, { ServerModalProps } from "./Modals/ServerModal";
import ServerManager from "./Sidebar/ServerManager";

const ContentView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { dispatchNavigation } = useContext(NavigationContext);
  const {
    selectedWell,
    selectedWellbore,
    selectedBhaRunGroup,
    selectedLogGroup,
    selectedLogTypeGroup,
    selectedLog,
    selectedLogCurveInfo,
    selectedRigGroup,
    selectedMessageGroup,
    selectedRiskGroup,
    selectedTrajectoryGroup,
    selectedTrajectory,
    selectedTubularGroup,
    selectedTubular,
    selectedWbGeometryGroup,
    selectedWbGeometry,
    selectedServer,
    currentSelected
  } = navigationState;
  const [view, setView] = useState(<WellsListView />);
  const { dispatchOperation } = useContext(OperationContext);
  useEffect(() => {
    if (currentSelected === null) {
      const server: Server = emptyServer()
      const standalone: boolean = true;
      const props: ServerModalProps = { server, dispatchNavigation, dispatchOperation , standalone }
      setView(<ServerModal {...props}/>)
    } else {
      if(currentSelected == listWellsFlag) {
        setView(<WellsListView />)
      } else if (currentSelected === selectedServer) {
        setView(<WellsListView />);
      } else if (currentSelected === selectedWell) {
        setView(<WellboresListView />);
      } else if (currentSelected === selectedWellbore) {
        setView(<WellboreObjectTypesListView />);
      } else if (currentSelected === selectedBhaRunGroup) {
        setView(<BhaRunsListView />);
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
      } else if (currentSelected === selectedRiskGroup) {
        setView(<RisksListView />);
      } else if (currentSelected === selectedLogCurveInfo) {
        setView(<CurveValuesView />);
      } else if (currentSelected === selectedTrajectoryGroup) {
        setView(<TrajectoriesListView />);
      } else if (currentSelected === selectedTrajectory) {
        setView(<TrajectoryView />);
      } else if (currentSelected === selectedTubularGroup) {
        setView(<TubularsListView />);
      } else if (currentSelected === selectedTubular) {
        setView(<TubularView />);
      } else if (currentSelected === selectedWbGeometryGroup) {
        setView(<WbGeometrysListView />);
      } else if (currentSelected === selectedWbGeometry) {
        setView(<WbGeometryView />);
      } else if (currentSelected === selectedJobsFlag) {
        setView(<JobsView />);
      } else if (currentSelected === selectedManageServerFlag) {
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
