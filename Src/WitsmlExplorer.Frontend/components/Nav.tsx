import { Breadcrumbs } from "@equinor/eds-core-react";
import TopRightCornerMenu from "components/TopRightCornerMenu";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { useGetObject } from "hooks/query/useGetObject";
import { useGetWell } from "hooks/query/useGetWell";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { capitalize } from "lodash";
import {
  ObjectType,
  ObjectTypeToModel,
  pluralizeObjectType
} from "models/objectType";
import { Server } from "models/server";
import Well from "models/well";
import Wellbore from "models/wellbore";
import { useContext, useEffect, useState } from "react";
import {
  NavLink,
  NavigateFunction,
  useMatch,
  useNavigate,
  useParams
} from "react-router-dom";
import {
  getJobsViewPath,
  getLogObjectViewPath,
  getLogObjectsViewPath,
  getLogTypesViewPath,
  getObjectGroupsViewPath,
  getObjectViewPath,
  getObjectsViewPath,
  getQueryViewPath,
  getSearchViewPath,
  getWellboresViewPath,
  getWellsViewPath
} from "routes/utils/pathBuilder";
import styled from "styled-components";
import { colors } from "styles/Colors";
import Icon from "styles/Icons";
import { v4 as uuid } from "uuid";

export default function Nav() {
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const navigate = useNavigate();
  const isJobsView = !!useMatch("servers/:serverUrl/jobs");
  const isQueryView = !!useMatch("servers/:serverUrl/query");
  const isSearchView = !!useMatch("servers/:serverUrl/search/:filterType");
  const {
    serverUrl,
    wellUid,
    wellboreUid,
    objectGroup,
    objectUid,
    logType,
    filterType
  } = useParams();
  const { connectedServer } = useConnectedServer();
  const [breadcrumbContent, setBreadcrumbContent] = useState([]);
  const { well } = useGetWell(connectedServer, wellUid);
  const { wellbore } = useGetWellbore(connectedServer, wellUid, wellboreUid);
  const { object } = useGetObject(
    connectedServer,
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
      getServerCrumb(connectedServer, navigate),
      getJobsCrumb(serverUrl, isJobsView, navigate),
      getQueryCrumb(serverUrl, isQueryView, navigate),
      getSearchCrumb(serverUrl, filterType, isSearchView, navigate),
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
    connectedServer,
    serverUrl,
    filterType,
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
          navigate(getWellsViewPath(server.url));
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
          navigate(getWellboresViewPath(serverUrl, well.uid));
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
            getObjectGroupsViewPath(serverUrl, wellbore.wellUid, wellbore.uid)
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
            objectGroup === ObjectType.Log
              ? getLogTypesViewPath(
                  serverUrl,
                  wellbore.wellUid,
                  wellbore.uid,
                  objectGroup
                )
              : getObjectsViewPath(
                  serverUrl,
                  wellbore.wellUid,
                  wellbore.uid,
                  objectGroup
                )
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
            getLogObjectsViewPath(
              serverUrl,
              wellbore.wellUid,
              wellbore.uid,
              ObjectType.Log,
              logType
            )
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
            logType
              ? getLogObjectViewPath(
                  serverUrl,
                  object.wellUid,
                  object.wellboreUid,
                  objectGroup,
                  logType,
                  object.uid
                )
              : getObjectViewPath(
                  serverUrl,
                  object.wellUid,
                  object.wellboreUid,
                  objectGroup,
                  object.uid
                )
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
          navigate(getJobsViewPath(serverUrl));
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
          navigate(getQueryViewPath(serverUrl));
        }
      }
    : {};
};

const getSearchCrumb = (
  serverUrl: string,
  filterType: string,
  isSearchView: boolean,
  navigate: NavigateFunction
) => {
  return isSearchView
    ? {
        name: "Search",
        onClick: () => {
          navigate(getSearchViewPath(serverUrl, filterType));
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
