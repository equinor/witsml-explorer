import { Breadcrumbs } from "@equinor/eds-core-react";
import TopRightCornerMenu from "components/TopRightCornerMenu";
import { NavigationAction } from "contexts/navigationAction";
import {
  SelectLogTypeAction,
  SelectObjectGroupAction,
  SelectServerAction,
  SelectWellAction,
  SelectWellboreAction
} from "contexts/navigationActions";
import NavigationContext, {
  NavigationState,
  Selectable,
  ViewFlags
} from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import { ObjectType, pluralizeObjectType } from "models/objectType";
import { Server } from "models/server";
import Well from "models/well";
import Wellbore, { calculateLogTypeDepthId } from "models/wellbore";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { colors } from "styles/Colors";
import Icon from "styles/Icons";
import { v4 as uuid } from "uuid";

const Nav = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    selectedServer,
    selectedWell,
    selectedWellbore,
    selectedLogTypeGroup,
    selectedObjectGroup,
    currentSelected
  } = navigationState;
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  const [breadcrumbContent, setBreadcrumbContent] = useState([]);
  const createBreadcrumbContent = () => {
    const groupCrumbs = Object.keys(ObjectType).map((key) => {
      return getObjectGroupCrumb(
        key as ObjectType,
        selectedObjectGroup,
        selectedWell,
        selectedWellbore,
        dispatchNavigation
      );
    });
    return [
      getServerCrumb(selectedServer, dispatchNavigation),
      getJobsCrumb(currentSelected),
      getSearchCrumb(currentSelected),
      getWellCrumb(selectedWell, dispatchNavigation),
      getWellboreCrumb(selectedWellbore, selectedWell, dispatchNavigation),
      ...groupCrumbs,
      getLogTypeCrumb(
        selectedLogTypeGroup,
        selectedWell,
        selectedWellbore,
        dispatchNavigation
      ),
      getObjectCrumb(navigationState, dispatchNavigation)
    ].filter((item) => item.name);
  };

  useEffect(() => {
    setBreadcrumbContent(createBreadcrumbContent());
  }, [currentSelected, selectedServer, selectedWell, selectedWellbore]);

  return (
    <nav>
      <Layout>
        <NavContainer>
          <Title style={{ color: colors.infographic.primaryMossGreen }}>
            WITSML Explorer
          </Title>
          {breadcrumbContent.length != 0 && (
            <Icon
              name="chevronRight"
              color={colors.text.staticIconsTertiary}
              size={18}
              style={{ minWidth: "18" }}
            />
          )}
          <StyledBreadcrumbs color="inherit" aria-label="breadcrumb">
            {breadcrumbContent.map((breadCrumb, index: number) => (
              <Breadcrumbs.Breadcrumb
                key={uuid()}
                href="#"
                onClick={breadCrumb.onClick}
                style={{
                  fontFamily:
                    breadcrumbContent.length - 1 == index
                      ? "EquinorMedium"
                      : "Equinor",
                  color: `${colors.infographic.primaryMossGreen}`
                }}
                maxWidth={180}
              >
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

const getServerCrumb = (
  selectedServer: Server,
  dispatch: (action: SelectServerAction) => void
) => {
  return selectedServer
    ? {
        name: selectedServer.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectServer,
            payload: { server: selectedServer }
          })
      }
    : {};
};

const getWellCrumb = (
  selectedWell: Well,
  dispatch: (action: SelectWellAction) => void
) => {
  return selectedWell
    ? {
        name: selectedWell.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectWell,
            payload: { well: selectedWell }
          })
      }
    : {};
};

const getWellboreCrumb = (
  selectedWellbore: Wellbore,
  selectedWell: Well,
  dispatch: (action: SelectWellboreAction) => void
) => {
  return selectedWellbore
    ? {
        name: selectedWellbore.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectWellbore,
            payload: { well: selectedWell, wellbore: selectedWellbore }
          })
      }
    : {};
};

const getObjectGroupCrumb = (
  objectType: ObjectType,
  selectedObjectGroup: ObjectType,
  selectedWell: Well,
  selectedWellbore: Wellbore,
  dispatch: (action: SelectObjectGroupAction) => void
) => {
  return selectedObjectGroup === objectType
    ? {
        name: pluralizeObjectType(objectType),
        onClick: () =>
          dispatch({
            type: NavigationType.SelectObjectGroup,
            payload: {
              wellUid: selectedWell.uid,
              wellboreUid: selectedWellbore.uid,
              objectType,
              objects: null
            }
          })
      }
    : {};
};

const getLogTypeCrumb = (
  selectedLogTypeGroup: string,
  selectedWell: Well,
  selectedWellbore: Wellbore,
  dispatch: (action: SelectLogTypeAction) => void
) => {
  return selectedLogTypeGroup
    ? {
        name:
          selectedLogTypeGroup === calculateLogTypeDepthId(selectedWellbore)
            ? "Depth"
            : "Time",
        onClick: () =>
          dispatch({
            type: NavigationType.SelectLogType,
            payload: {
              well: selectedWell,
              wellbore: selectedWellbore,
              logTypeGroup: selectedLogTypeGroup
            }
          })
      }
    : {};
};

const getObjectCrumb = (
  navigationState: NavigationState,
  dispatch: (action: NavigationAction) => void
) => {
  return navigationState.selectedObject?.name
    ? {
        name: navigationState.selectedObject.name,
        onClick: () =>
          dispatch({
            type: NavigationType.SelectObject,
            payload: {
              well: navigationState.selectedWell,
              wellbore: navigationState.selectedWellbore,
              object: navigationState.selectedObject,
              objectType: navigationState.selectedObjectGroup
            }
          })
      }
    : {};
};

const getJobsCrumb = (currentSelected: Selectable) => {
  return currentSelected == ViewFlags.Jobs
    ? {
        name: "Jobs"
      }
    : {};
};

const getSearchCrumb = (currentSelected: Selectable) => {
  return currentSelected == ViewFlags.ObjectSearchView
    ? {
        name: "Search"
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
  color: ${colors.interactive.primaryResting};
  font-size: 1rem;
  font-family: "EquinorBold";
  min-width: 143px;
`;

const StyledBreadcrumbs = styled(Breadcrumbs)`
  padding-top: 0.2em;
  width: auto;
  height: 1.5rem;
  overflow: clip;
`;

const NavContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  height: 2.5rem;
`;

export default Nav;
