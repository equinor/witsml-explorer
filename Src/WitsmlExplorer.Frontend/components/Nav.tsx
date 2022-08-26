import { Breadcrumbs } from "@equinor/eds-core-react";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import NavigationContext from "../contexts/navigationContext";
import {
  Selectable,
  SelectBhaRunGroupAction,
  selectedJobsFlag,
  SelectLogGroupAction,
  SelectLogObjectAction,
  SelectLogTypeAction,
  SelectMessageGroupAction,
  SelectMessageObjectAction,
  SelectRigGroupAction,
  SelectRiskGroupAction,
  SelectServerAction,
  SelectTrajectoryAction,
  SelectTrajectoryGroupAction,
  SelectTubularAction,
  SelectTubularGroupAction,
  SelectWbGeometryGroupAction,
  SelectWellAction,
  SelectWellboreAction
} from "../contexts/navigationStateReducer";
import NavigationType from "../contexts/navigationType";
import LogObject from "../models/logObject";
import MessageObject from "../models/messageObject";
import { Server } from "../models/server";
import Trajectory from "../models/trajectory";
import Tubular from "../models/tubular";
import Well from "../models/well";
import Wellbore, { calculateLogGroupId, calculateLogTypeDepthId, calculateTrajectoryGroupId, calculateTubularGroupId } from "../models/wellbore";
import JobsButton from "./JobsButton";
import TopRightCornerMenu from "./TopRightCornerMenu";

const Nav = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    selectedServer,
    selectedWell,
    selectedWellbore,
    selectedBhaRunGroup,
    selectedLogGroup,
    selectedLogTypeGroup,
    selectedLog,
    selectedMessage,
    selectedMessageGroup,
    selectedRiskGroup,
    selectedRigGroup,
    selectedTrajectoryGroup,
    selectedTrajectory,
    selectedTubularGroup,
    selectedTubular,
    selectedWbGeometryGroup,
    currentSelected
  } = navigationState;

  const [breadcrumbContent, setBreadcrumbContent] = useState([]);
  const createBreadcrumbContent = () => {
    return [
      getServerCrumb(selectedServer, dispatchNavigation),
      getJobsCrumb(currentSelected),
      getWellCrumb(selectedWell, dispatchNavigation),
      getWellboreCrumb(selectedWellbore, selectedWell, dispatchNavigation),
      getBhaRunGroupCrumb(selectedBhaRunGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getLogGroupCrumb(selectedLogGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getLogTypeCrumb(selectedLogTypeGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getLogCrumbs(selectedLog, selectedWell, selectedWellbore, selectedLogTypeGroup, dispatchNavigation),
      getMessageGroupCrumb(selectedMessageGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getMessageCrumbs(selectedMessage, selectedWell, selectedWellbore, dispatchNavigation),
      getRiskGroupCrumb(selectedRiskGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getRigGroupCrumb(selectedRigGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getTrajectoryGroupCrumb(selectedTrajectoryGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getTrajectoryCrumb(selectedTrajectory, selectedWell, selectedWellbore, dispatchNavigation),
      getTubularGroupCrumb(selectedTubularGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getTubularCrumb(selectedTubular, selectedWell, selectedWellbore, dispatchNavigation),
      getWbGeometryGroupCrumb(selectedWbGeometryGroup, selectedWell, selectedWellbore, dispatchNavigation)
    ].filter((item) => item.name);
  };

  useEffect(() => {
    setBreadcrumbContent(createBreadcrumbContent());
  }, [currentSelected]);

  return (
    <nav>
      <Layout>
        <Title>WITSML Explorer</Title>
        <JobsButton />
        <StyledBreadcrumbs color="inherit" aria-label="breadcrumb">
          {breadcrumbContent.map((breadCrumb, index) => (
            <Breadcrumbs.Breadcrumb key={index} href="#" onClick={breadCrumb.onClick}>
              {breadCrumb.name}
            </Breadcrumbs.Breadcrumb>
          ))}
        </StyledBreadcrumbs>
        <TopRightCornerMenu />
      </Layout>
    </nav>
  );
};

const getServerCrumb = (selectedServer: Server, dispatch: (action: SelectServerAction) => void) => {
  return selectedServer
    ? {
        name: selectedServer.name,
        onClick: () => dispatch({ type: NavigationType.SelectServer, payload: { server: selectedServer } })
      }
    : {};
};

const getWellCrumb = (selectedWell: Well, dispatch: (action: SelectWellAction) => void) => {
  return selectedWell
    ? {
        name: selectedWell.name,
        onClick: () => dispatch({ type: NavigationType.SelectWell, payload: { well: selectedWell, wellbores: selectedWell.wellbores } })
      }
    : {};
};

const getWellboreCrumb = (selectedWellbore: Wellbore, selectedWell: Well, dispatch: (action: SelectWellboreAction) => void) => {
  return selectedWellbore
    ? {
        name: selectedWellbore.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectWellbore,
            payload: {
              well: selectedWell,
              wellbore: selectedWellbore,
              bhaRuns: selectedWellbore.bhaRuns,
              logs: selectedWellbore.logs,
              rigs: selectedWellbore.rigs,
              trajectories: selectedWellbore.trajectories,
              messages: selectedWellbore.messages,
              risks: selectedWellbore.risks,
              tubulars: selectedWellbore.tubulars,
              wbGeometrys: selectedWellbore.wbGeometrys
            }
          })
      }
    : {};
};

const getBhaRunGroupCrumb = (selectedBhaRunGroup: string, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectBhaRunGroupAction) => void) => {
  return selectedBhaRunGroup
    ? {
        name: "BhaRuns",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectBhaRunGroup,
            payload: { well: selectedWell, wellbore: selectedWellbore, bhaRunGroup: selectedBhaRunGroup }
          })
      }
    : {};
};

const getMessageGroupCrumb = (selectedMessageGroup: string, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectMessageGroupAction) => void) => {
  return selectedMessageGroup
    ? {
        name: "Messages",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectMessageGroup,
            payload: { well: selectedWell, wellbore: selectedWellbore, messageGroup: selectedMessageGroup }
          })
      }
    : {};
};

const getMessageCrumbs = (selectedMessage: MessageObject, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectMessageObjectAction) => void) => {
  return selectedMessage?.name
    ? {
        name: selectedMessage.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectMessageObject,
            payload: {
              well: selectedWell,
              wellbore: selectedWellbore,
              message: selectedMessage
            }
          })
      }
    : {};
};
const getRiskGroupCrumb = (selectedRiskGroup: string, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectRiskGroupAction) => void) => {
  return selectedRiskGroup
    ? {
        name: "Risks",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectRiskGroup,
            payload: { well: selectedWell, wellbore: selectedWellbore, riskGroup: selectedRiskGroup }
          })
      }
    : {};
};

const getWbGeometryGroupCrumb = (selectedWbGeometryGroup: string, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectWbGeometryGroupAction) => void) => {
  return selectedWbGeometryGroup
    ? {
        name: "WbGeometries",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectWbGeometryGroup,
            payload: { well: selectedWell, wellbore: selectedWellbore, wbGeometryGroup: selectedWbGeometryGroup }
          })
      }
    : {};
};

const getLogGroupCrumb = (selectedLogGroup: string, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectLogGroupAction) => void) => {
  return selectedLogGroup
    ? {
        name: "Logs",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectLogGroup,
            payload: { well: selectedWell, wellbore: selectedWellbore, logGroup: selectedLogGroup }
          })
      }
    : {};
};

const getLogTypeCrumb = (selectedLogTypeGroup: string, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectLogTypeAction) => void) => {
  return selectedLogTypeGroup
    ? {
        name: selectedLogTypeGroup === calculateLogTypeDepthId(selectedWellbore) ? "Depth" : "Time",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectLogType,
            payload: { well: selectedWell, wellbore: selectedWellbore, logGroup: calculateLogGroupId(selectedWellbore), logTypeGroup: selectedLogTypeGroup }
          })
      }
    : {};
};

const getLogCrumbs = (selectedLog: LogObject, selectedWell: Well, selectedWellbore: Wellbore, selectedLogTypeGroup: string, dispatch: (action: SelectLogObjectAction) => void) => {
  return selectedLog?.name
    ? {
        name: selectedLog.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectLogObject,
            payload: {
              well: selectedWell,
              wellbore: selectedWellbore,
              log: selectedLog
            }
          })
      }
    : {};
};

const getRigGroupCrumb = (selectedRigGroup: string, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectRigGroupAction) => void) => {
  return selectedRigGroup
    ? {
        name: "Rigs",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectRigGroup,
            payload: { well: selectedWell, wellbore: selectedWellbore, rigGroup: selectedRigGroup }
          })
      }
    : {};
};

const getTrajectoryGroupCrumb = (selectedTrajectoryGroup: string, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectTrajectoryGroupAction) => void) => {
  return selectedTrajectoryGroup
    ? {
        name: "Trajectories",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectTrajectoryGroup,
            payload: { well: selectedWell, wellbore: selectedWellbore, trajectoryGroup: selectedTrajectoryGroup }
          })
      }
    : {};
};

const getTrajectoryCrumb = (selectedTrajectory: Trajectory, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectTrajectoryAction) => void) => {
  return selectedTrajectory?.name
    ? {
        name: selectedTrajectory.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectTrajectory,
            payload: { well: selectedWell, wellbore: selectedWellbore, trajectoryGroup: calculateTrajectoryGroupId(selectedWellbore), trajectory: selectedTrajectory }
          })
      }
    : {};
};

const getTubularGroupCrumb = (selectedTubularGroup: string, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectTubularGroupAction) => void) => {
  return selectedTubularGroup
    ? {
        name: "Tubulars",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectTubularGroup,
            payload: { well: selectedWell, wellbore: selectedWellbore, tubularGroup: selectedTubularGroup }
          })
      }
    : {};
};

const getTubularCrumb = (selectedTubular: Tubular, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectTubularAction) => void) => {
  return selectedTubular?.name
    ? {
        name: selectedTubular.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectTubular,
            payload: { well: selectedWell, wellbore: selectedWellbore, tubularGroup: calculateTubularGroupId(selectedWellbore), tubular: selectedTubular }
          })
      }
    : {};
};

const getJobsCrumb = (currentSelected: Selectable) => {
  return currentSelected == selectedJobsFlag
    ? {
        name: "Jobs"
      }
    : {};
};

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Title = styled.p`
  line-height: 1rem;
  padding-left: 2rem;
  width: 15vw;
`;

const StyledBreadcrumbs = styled(Breadcrumbs)`
  padding-left: 10rem;
  width: 80vw;
`;

export default Nav;
