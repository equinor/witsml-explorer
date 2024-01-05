import { Breadcrumbs } from "@equinor/eds-core-react";
import { capitalize } from "lodash";
import { useContext, useEffect, useState } from "react";
import {
  NavLink,
  NavigateFunction,
  useNavigate,
  useParams
} from "react-router-dom";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import NavigationContext, {
  Selectable,
  ViewFlags
} from "../contexts/navigationContext";
import OperationContext from "../contexts/operationContext";
import ObjectOnWellbore from "../models/objectOnWellbore";
import { ObjectType, pluralizeObjectType } from "../models/objectType";
import { Server } from "../models/server";
import Well from "../models/well";
import Wellbore from "../models/wellbore";
import { colors } from "../styles/Colors";
import Icon from "../styles/Icons";
import TopRightCornerMenu from "./TopRightCornerMenu";

export default function Nav() {
  const { navigationState } = useContext(NavigationContext);
  const {
    selectedServer,
    selectedWell,
    selectedWellbore,
    selectedObjectGroup,
    selectedObject,
    currentSelected
  } = navigationState;
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const navigate = useNavigate();
  const { serverUrl, wellUid, wellboreUid, objectGroup, objectUid, logType } =
    useParams();
  const [breadcrumbContent, setBreadcrumbContent] = useState([]);

  const createBreadcrumbContent = () => {
    const groupCrumbs = Object.keys(ObjectType).map((key) => {
      return getObjectGroupCrumb(
        key as ObjectType,
        serverUrl,
        wellUid,
        wellboreUid,
        objectGroup,
        selectedObjectGroup,
        navigate
      );
    });
    return [
      getServerCrumb(serverUrl, selectedServer, navigate),
      getJobsCrumb(serverUrl, currentSelected, navigate),
      getQueryCrumb(serverUrl, currentSelected, navigate),
      getSearchCrumb(currentSelected),
      getWellCrumb(serverUrl, wellUid, selectedWell, navigate),
      getWellboreCrumb(
        serverUrl,
        wellUid,
        wellboreUid,
        selectedWellbore,
        navigate
      ),
      ...groupCrumbs,
      getLogTypeCrumb(serverUrl, wellUid, wellboreUid, logType, navigate),
      getObjectCrumb(
        serverUrl,
        wellUid,
        wellboreUid,
        objectGroup,
        objectUid,
        logType,
        selectedObject,
        navigate
      )
    ].filter((item) => item.name);
  };

  useEffect(() => {
    setBreadcrumbContent(createBreadcrumbContent());
  }, [
    serverUrl,
    wellUid,
    wellboreUid,
    objectGroup,
    objectUid,
    logType,
    currentSelected
  ]);

  return (
    <nav>
      <Layout>
        <NavContainer>
          <NavLink to={"/"} style={{ textDecoration: "none" }}>
            <Title style={{ color: colors.infographic.primaryMossGreen }}>
              WITSML Explorer
            </Title>
          </NavLink>
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
}

const getServerCrumb = (
  serverUrl: string,
  selectedServer: Server,
  navigate: NavigateFunction
) => {
  return serverUrl && selectedServer
    ? {
        name: selectedServer.name,
        onClick: () => {
          navigate(`servers/${encodeURIComponent(serverUrl)}/wells`);
        }
      }
    : {};
};

const getWellCrumb = (
  serverUrl: string,
  wellUid: string,
  selectedWell: Well,
  navigate: NavigateFunction
) => {
  return serverUrl && wellUid && selectedWell
    ? {
        name: selectedWell.name,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(
              serverUrl
            )}/wells/${wellUid}/wellbores`
          );
        }
      }
    : {};
};

const getWellboreCrumb = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  selectedWellbore: Wellbore,
  navigate: NavigateFunction
) => {
  return serverUrl && wellUid && wellboreUid && selectedWellbore
    ? {
        name: selectedWellbore.name,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(
              serverUrl
            )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups`
          );
        }
      }
    : {};
};

const getObjectGroupCrumb = (
  objectType: ObjectType,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string,
  selectedObjectGroup: ObjectType,
  navigate: NavigateFunction
) => {
  const pluralizedObjectType = pluralizeObjectType(objectType);
  return serverUrl &&
    wellUid &&
    wellboreUid &&
    objectGroup &&
    selectedObjectGroup === objectType
    ? {
        name: pluralizedObjectType,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(
              serverUrl
            )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${objectGroup}/${
              objectGroup === "logs" ? "logtypes" : "objects"
            }`
          );
        }
      }
    : {};
};

const getLogTypeCrumb = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  logType: string,
  navigate: NavigateFunction
) => {
  return serverUrl && wellUid && wellboreUid && logType
    ? {
        name: capitalize(logType),
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(
              serverUrl
            )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/logs/logtypes/${logType}/objects`
          );
        }
      }
    : {};
};

const getObjectCrumb = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string,
  objectUid: string,
  logType: string,
  selectedObject: ObjectOnWellbore,
  navigate: NavigateFunction
) => {
  return serverUrl &&
    wellUid &&
    wellboreUid &&
    objectGroup &&
    objectUid &&
    logType &&
    selectedObject
    ? {
        name: selectedObject.name,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(
              serverUrl
            )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${objectGroup}/${
              logType ? `logtypes/${logType}` : ""
            }/objects/${objectUid}`
          );
        }
      }
    : {};
};

const getJobsCrumb = (
  serverUrl: string,
  currentSelected: Selectable,
  navigate: NavigateFunction
) => {
  return currentSelected === ViewFlags.Jobs
    ? {
        name: "Jobs",
        onClick: () => {
          navigate(`servers/${encodeURIComponent(serverUrl)}/jobs`);
        }
      }
    : {};
};

const getQueryCrumb = (
  serverUrl: string,
  currentSelected: Selectable,
  navigate: NavigateFunction
) => {
  return currentSelected === ViewFlags.Query
    ? {
        name: "Query",
        onClick: () => {
          navigate(`servers/${encodeURIComponent(serverUrl)}/query`);
        }
      }
    : {};
};

const getSearchCrumb = (currentSelected: Selectable) => {
  return currentSelected === ViewFlags.ObjectSearchView
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
