import { Breadcrumbs } from "@equinor/eds-core-react";
import { capitalize } from "lodash";
import { useContext, useEffect, useState } from "react";
import {
  NavLink,
  NavigateFunction,
  useMatch,
  useNavigate,
  useParams
} from "react-router-dom";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { useAuthorizationState } from "../contexts/authorizationStateContext";
import OperationContext from "../contexts/operationContext";
import { useGetObject } from "../hooks/query/useGetObject";
import { useGetWell } from "../hooks/query/useGetWell";
import { useGetWellbore } from "../hooks/query/useGetWellbore";
import {
  ObjectType,
  ObjectTypeToModel,
  pluralizeObjectType
} from "../models/objectType";
import { Server } from "../models/server";
import Well from "../models/well";
import Wellbore from "../models/wellbore";
import { AuthorizationStatus } from "../services/authorizationService";
import { colors } from "../styles/Colors";
import Icon from "../styles/Icons";
import TopRightCornerMenu from "./TopRightCornerMenu";

export default function Nav() {
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const navigate = useNavigate();
  const isJobsView = !!useMatch("servers/:serverUrl/jobs");
  const isQueryView = !!useMatch("servers/:serverUrl/query");
  const isSearchView = !!useMatch("servers/:serverUrl/search");
  const { serverUrl, wellUid, wellboreUid, objectGroup, objectUid, logType } =
    useParams();
  const { authorizationState } = useAuthorizationState();
  const [breadcrumbContent, setBreadcrumbContent] = useState([]);
  const { well } = useGetWell(authorizationState?.server, wellUid, {
    enabled: authorizationState?.status === AuthorizationStatus.Authorized
  });
  const { wellbore } = useGetWellbore(
    authorizationState?.server,
    wellUid,
    wellboreUid
  );
  const { object } = useGetObject(
    authorizationState?.server,
    wellUid,
    wellboreUid,
    objectGroup as ObjectType,
    objectUid
  );

  const createBreadcrumbContent = () => {
    const groupCrumbs = Object.keys(ObjectType).map((key) => {
      return getObjectGroupCrumb(
        key as ObjectType,
        serverUrl,
        wellbore,
        objectGroup,
        navigate
      );
    });
    return [
      getServerCrumb(authorizationState?.server, navigate),
      getJobsCrumb(serverUrl, isJobsView, navigate),
      getQueryCrumb(serverUrl, isQueryView, navigate),
      getSearchCrumb(serverUrl, isSearchView, navigate),
      getWellCrumb(serverUrl, well, navigate),
      getWellboreCrumb(serverUrl, wellbore, navigate),
      ...groupCrumbs,
      getLogTypeCrumb(serverUrl, wellbore, logType, navigate),
      getObjectCrumb(serverUrl, objectGroup, object, logType, navigate)
    ].filter((item) => item.name);
  };

  useEffect(() => {
    setBreadcrumbContent(createBreadcrumbContent());
  }, [
    authorizationState?.server,
    serverUrl,
    objectGroup,
    well,
    wellbore,
    object,
    logType,
    isJobsView,
    isQueryView,
    isSearchView
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

const getServerCrumb = (server: Server, navigate: NavigateFunction) => {
  return server
    ? {
        name: server.name,
        onClick: () => {
          navigate(`servers/${encodeURIComponent(server.url)}/wells`);
        }
      }
    : {};
};

const getWellCrumb = (
  serverUrl: string,
  well: Well,
  navigate: NavigateFunction
) => {
  return serverUrl && well
    ? {
        name: well.name,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(serverUrl)}/wells/${
              well.uid
            }/wellbores`
          );
        }
      }
    : {};
};

const getWellboreCrumb = (
  serverUrl: string,
  wellbore: Wellbore,
  navigate: NavigateFunction
) => {
  return serverUrl && wellbore
    ? {
        name: wellbore.name,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(serverUrl)}/wells/${
              wellbore.wellUid
            }/wellbores/${wellbore.uid}/objectgroups`
          );
        }
      }
    : {};
};

const getObjectGroupCrumb = (
  objectType: ObjectType,
  serverUrl: string,
  wellbore: Wellbore,
  objectGroup: string,
  navigate: NavigateFunction
) => {
  const pluralizedObjectType = pluralizeObjectType(objectType);
  return serverUrl && wellbore && objectGroup === objectType
    ? {
        name: pluralizedObjectType,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(serverUrl)}/wells/${
              wellbore.wellUid
            }/wellbores/${wellbore.uid}/objectgroups/${objectGroup}/${
              objectGroup === ObjectType.Log ? "logtypes" : "objects"
            }`
          );
        }
      }
    : {};
};

const getLogTypeCrumb = (
  serverUrl: string,
  wellbore: Wellbore,
  logType: string,
  navigate: NavigateFunction
) => {
  return serverUrl && wellbore && logType
    ? {
        name: capitalize(logType),
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(serverUrl)}/wells/${
              wellbore.wellUid
            }/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.Log
            }/logtypes/${logType}/objects`
          );
        }
      }
    : {};
};

function getObjectCrumb<T extends ObjectType>(
  serverUrl: string,
  objectGroup: string,
  object: ObjectTypeToModel[T],
  logType: string,
  navigate: NavigateFunction
) {
  return serverUrl && objectGroup && object
    ? {
        name: object.name,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(serverUrl)}/wells/${
              object.wellUid
            }/wellbores/${object.wellboreUid}/objectgroups/${objectGroup}/${
              logType ? `logtypes/${logType}/` : ""
            }objects/${object.uid}`
          );
        }
      }
    : {};
}

const getJobsCrumb = (
  serverUrl: string,
  isJobsView: boolean,
  navigate: NavigateFunction
) => {
  return isJobsView
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
  isQueryView: boolean,
  navigate: NavigateFunction
) => {
  return isQueryView
    ? {
        name: "Query",
        onClick: () => {
          navigate(`servers/${encodeURIComponent(serverUrl)}/query`);
        }
      }
    : {};
};

const getSearchCrumb = (
  serverUrl: string,
  isSearchView: boolean,
  navigate: NavigateFunction
) => {
  return isSearchView
    ? {
        name: "Search",
        onClick: () => {
          navigate(`servers/${encodeURIComponent(serverUrl)}/search`);
        }
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
