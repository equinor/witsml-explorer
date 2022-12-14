import { Breadcrumbs } from "@equinor/eds-core-react";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import {
  SelectBhaRunGroupAction,
  SelectLogGroupAction,
  SelectLogObjectAction,
  SelectLogTypeAction,
  SelectMessageGroupAction,
  SelectRigGroupAction,
  SelectRiskGroupAction,
  SelectServerAction,
  SelectTrajectoryAction,
  SelectTrajectoryGroupAction,
  SelectTubularAction,
  SelectTubularGroupAction,
  SelectWbGeometryAction,
  SelectWbGeometryGroupAction,
  SelectWellAction,
  SelectWellboreAction
} from "../contexts/navigationActions";
import NavigationContext, { Selectable, selectedJobsFlag } from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import LogObject from "../models/logObject";
import { Server } from "../models/server";
import Trajectory from "../models/trajectory";
import Tubular from "../models/tubular";
import WbGeometryObject from "../models/wbGeometry";
import Well from "../models/well";
import Wellbore, { calculateLogGroupId, calculateLogTypeDepthId, calculateTrajectoryGroupId, calculateTubularGroupId, calculateWbGeometryGroupId } from "../models/wellbore";
import TopRightCornerMenu from "./TopRightCornerMenu";
import { colors } from "../styles/Colors";
import Icon from "../styles/Icons";

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
    selectedMessageGroup,
    selectedRiskGroup,
    selectedRigGroup,
    selectedTrajectoryGroup,
    selectedTrajectory,
    selectedTubularGroup,
    selectedTubular,
    selectedWbGeometryGroup,
    selectedWbGeometry,
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
      getRiskGroupCrumb(selectedRiskGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getRigGroupCrumb(selectedRigGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getTrajectoryGroupCrumb(selectedTrajectoryGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getTrajectoryCrumb(selectedTrajectory, selectedWell, selectedWellbore, dispatchNavigation),
      getTubularGroupCrumb(selectedTubularGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getTubularCrumb(selectedTubular, selectedWell, selectedWellbore, dispatchNavigation),
      getWbGeometryGroupCrumb(selectedWbGeometryGroup, selectedWell, selectedWellbore, dispatchNavigation),
      getWbGeometryCrumb(selectedWbGeometry, selectedWell, selectedWellbore, dispatchNavigation)
    ].filter((item) => item.name);
  };

  useEffect(() => {
    setBreadcrumbContent(createBreadcrumbContent());
  }, [currentSelected, selectedServer]);

  return (
    <nav>
      <Layout>
          <NavContainer>
          <Title>WITSML Explorer</Title>
          {breadcrumbContent.length ? <Icon name="chevronRight" color={colors.text.staticIconsTertiary} size={18} /> : ''}
          <StyledBreadcrumbs color="inherit" aria-label="breadcrumb">
            {breadcrumbContent.map((breadCrumb, index: number) => (
              <Breadcrumbs.Breadcrumb maxWidth={100} key={index} href="#" onClick={breadCrumb.onClick}
                style={{
                  "fontFamily": breadcrumbContent.length - 1 == index ? "EquinorMedium" : "Equinor",
                  "color": `${colors.interactive.primaryResting}`
                }}>
                {breadCrumb.name}
              </Breadcrumbs.Breadcrumb>
            ))}
          </StyledBreadcrumbs>
        </NavContainer>
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

const getWbGeometryCrumb = (selectedWbGeometry: WbGeometryObject, selectedWell: Well, selectedWellbore: Wellbore, dispatch: (action: SelectWbGeometryAction) => void) => {
  return selectedWbGeometry?.name
    ? {
        name: selectedWbGeometry.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectWbGeometry,
            payload: { well: selectedWell, wellbore: selectedWellbore, wbGeometryGroup: calculateWbGeometryGroupId(selectedWellbore), wbGeometry: selectedWbGeometry }
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
  justify-content: space-between;
`;

const Title = styled.p`
  line-height: 1rem;
  padding-left: 1rem;
  color:${colors.interactive.primaryResting};
  font-size:1rem;
  font-family:'EquinorBold';
`;

const StyledBreadcrumbs = styled(Breadcrumbs)`
  padding-top: 0.2em;
  width: 60%;
`;
const NavContainer = styled.div`{
  display:flex;
  width:100%;
  align-items: center;
  height:2.5rem;
}`

export default Nav;
