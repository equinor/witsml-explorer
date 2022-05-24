import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Breadcrumbs } from "@equinor/eds-core-react";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import Wellbore, { calculateLogGroupId, calculateLogTypeDepthId, calculateTrajectoryGroupId, calculateTubularGroupId } from "../models/wellbore";
import { Server } from "../models/server";
import {
  SelectLogGroupAction,
  SelectLogObjectAction,
  SelectLogTypeAction,
  SelectMessageGroupAction,
  SelectMessageObjectAction,
  SelectRigGroupAction,
  SelectServerAction,
  SelectTrajectoryAction,
  SelectTrajectoryGroupAction,
  SelectTubularAction,
  SelectTubularGroupAction,
  SelectWellAction,
  SelectWellboreAction
} from "../contexts/navigationStateReducer";
import Well from "../models/well";
import LogObject from "../models/logObject";
import MessageObject from "../models/messageObject";
import Trajectory from "../models/trajectory";
import ThemeMenu from "./ThemeMenu";
import Tubular from "../models/tubular";

const Nav = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    selectedServer,
    selectedWell,
    selectedWellbore,
    selectedLogGroup,
    selectedLogTypeGroup,
    selectedLog,
    selectedMessage,
    selectedMessageGroup,
    selectedRigGroup,
    selectedTrajectoryGroup,
    selectedTrajectory,
    selectedTubularGroup,
    selectedTubular,
    currentSelected
  } = navigationState;

  const [breadcrumbContent, setBreadcrumbContent] = useState([]);
  const createBreadcrumbContent = () => {
    return [
      getServerCrumb(selectedServer, dispatchNavigation),
      getWellCrumb(selectedWell, dispatchNavigation),
      getWellboreCrumb(selectedWellbore, selectedWell, dispatchNavigation),
      getLogGroupCrumb(selectedLogGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getLogTypeCrumb(selectedLogTypeGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getLogCrumbs(selectedLog, selectedWell, selectedWellbore, selectedLogTypeGroup, dispatchNavigation),
      getMessageGroupCrumb(selectedMessageGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getMessageCrumbs(selectedMessage, selectedWell, selectedWellbore, dispatchNavigation),
      getRigGroupCrumb(selectedRigGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getTrajectoryGroupCrumb(selectedTrajectoryGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getTrajectoryCrumb(selectedTrajectory, selectedWell, selectedWellbore, dispatchNavigation),
      getTubularGroupCrumb(selectedTubularGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getTubularCrumb(selectedTubular, selectedWell, selectedWellbore, dispatchNavigation)
    ].filter((item) => item.name);
  };

  useEffect(() => {
    setBreadcrumbContent(createBreadcrumbContent());
  }, [currentSelected]);

  return (
    <nav>
      <Layout>
        <Title>WITSML Explorer</Title>
        <StyledBreadcrumbs color="inherit" aria-label="breadcrumb">
          {breadcrumbContent.map((breadCrumb, index) => (
            <Breadcrumbs.Breadcrumb key={index} href="#" onClick={breadCrumb.onClick}>
              {breadCrumb.name}
            </Breadcrumbs.Breadcrumb>
          ))}
        </StyledBreadcrumbs>
        <ThemeMenu />
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
              logs: selectedWellbore.logs,
              rigs: selectedWellbore.rigs,
              trajectories: selectedWellbore.trajectories,
              messages: selectedWellbore.messages,
              tubulars: selectedWellbore.tubulars
            }
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
