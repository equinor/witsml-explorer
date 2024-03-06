import { Breadcrumbs as EdsBreadcrumbs } from "@equinor/eds-core-react";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { useGetObject } from "hooks/query/useGetObject";
import { useGetWell } from "hooks/query/useGetWell";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { useGetActiveRoute } from "hooks/useGetActiveRoute";
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
  useNavigate,
  useParams
} from "react-router-dom";
import {
  getLogObjectViewPath,
  getLogObjectsViewPath,
  getLogTypesViewPath,
  getObjectGroupsViewPath,
  getObjectViewPath,
  getObjectsViewPath,
  getWellboresViewPath,
  getWellsViewPath
} from "routes/utils/pathBuilder";
import styled from "styled-components";
import { colors } from "styles/Colors";
import Icon from "styles/Icons";
import { v4 as uuid } from "uuid";

export function Breadcrumbs() {
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const navigate = useNavigate();
  const {
    isJobsView,
    isQueryView,
    isSearchView,
    isWellsView,
    isWellboresView,
    isObjectGroupsView,
    isObjectsView,
    isObjectView,
    isLogTypesView,
    isLogObjectsView,
    isLogObjectView,
    isLogCurveValuesView
  } = useGetActiveRoute();

  const { serverUrl, wellUid, wellboreUid, objectGroup, objectUid, logType } =
    useParams();
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
    return [
      getServerCrumb(connectedServer, navigate, isWellsView),
      getJobsCrumb(isJobsView),
      getQueryCrumb(isQueryView),
      getSearchCrumb(isSearchView),
      getWellCrumb(serverUrl, well, navigate, isWellboresView),
      getWellboreCrumb(serverUrl, wellbore, navigate, isObjectGroupsView),
      getObjectGroupCrumb(
        serverUrl,
        wellbore,
        objectGroup,
        navigate,
        isObjectsView,
        isLogTypesView
      ),
      getLogTypeCrumb(serverUrl, wellbore, logType, navigate, isLogObjectsView),
      getObjectCrumb(
        serverUrl,
        objectGroup,
        object,
        logType,
        navigate,
        isObjectView,
        isLogObjectView
      )
    ].filter((item) => item.name);
  };

  useEffect(() => {
    setBreadcrumbContent(createBreadcrumbContent());
  }, [
    connectedServer,
    serverUrl,
    objectGroup,
    well,
    wellbore,
    object,
    logType,
    isJobsView,
    isQueryView,
    isSearchView,
    isLogCurveValuesView
  ]);

  return (
    <BreadcrumbsContainer>
      <NavLink to={"/"} style={{ textDecoration: "none" }}>
        <Title style={{ color: colors.infographic.primaryMossGreen }}>
          WITSML Explorer
        </Title>
      </NavLink>
      {breadcrumbContent.length !== 0 && (
        <Icon
          name="chevronRight"
          color={colors.text.staticIconsTertiary}
          size={18}
          style={{ minWidth: "18" }}
        />
      )}
      <StyledBreadcrumbs color="inherit" aria-label="breadcrumb">
        {breadcrumbContent.map((breadCrumb, index: number) => (
          <EdsBreadcrumbs.Breadcrumb
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
          </EdsBreadcrumbs.Breadcrumb>
        ))}
      </StyledBreadcrumbs>
    </BreadcrumbsContainer>
  );
}

const getServerCrumb = (
  server: Server,
  navigate: NavigateFunction,
  isWellsView: boolean
) => {
  return server
    ? {
        name: server.name,
        onClick: () => {
          if (isWellsView) return;
          navigate(getWellsViewPath(server.url));
        }
      }
    : {};
};

const getWellCrumb = (
  serverUrl: string,
  well: Well,
  navigate: NavigateFunction,
  isWellboresView: boolean
) => {
  return serverUrl && well
    ? {
        name: well.name,
        onClick: () => {
          if (isWellboresView) return;
          navigate(getWellboresViewPath(serverUrl, well.uid));
        }
      }
    : {};
};

const getWellboreCrumb = (
  serverUrl: string,
  wellbore: Wellbore,
  navigate: NavigateFunction,
  isObjectGroupsView: boolean
) => {
  return serverUrl && wellbore
    ? {
        name: wellbore.name,
        onClick: () => {
          if (isObjectGroupsView) return;
          navigate(
            getObjectGroupsViewPath(serverUrl, wellbore.wellUid, wellbore.uid)
          );
        }
      }
    : {};
};

const getObjectGroupCrumb = (
  serverUrl: string,
  wellbore: Wellbore,
  objectGroup: string,
  navigate: NavigateFunction,
  isObjectsView: boolean,
  isLogTypesView: boolean
) => {
  return serverUrl && wellbore && objectGroup
    ? {
        name: pluralizeObjectType(objectGroup as ObjectType),
        onClick: () => {
          if (isObjectsView || isLogTypesView) return;
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
  navigate: NavigateFunction,
  isLogObjectsView: boolean
) => {
  return serverUrl && wellbore && logType
    ? {
        name: capitalize(logType),
        onClick: () => {
          if (isLogObjectsView) return;
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
  navigate: NavigateFunction,
  isObjectView: boolean,
  isLogObjectView: boolean
) {
  return serverUrl && objectGroup && object
    ? {
        name: object.name,
        onClick: () => {
          if (isObjectView || isLogObjectView) return;
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

const getJobsCrumb = (isJobsView: boolean) => {
  return isJobsView
    ? {
        name: "Jobs"
      }
    : {};
};

const getQueryCrumb = (isQueryView: boolean) => {
  return isQueryView
    ? {
        name: "Query"
      }
    : {};
};

const getSearchCrumb = (isSearchView: boolean) => {
  return isSearchView
    ? {
        name: "Search"
      }
    : {};
};

const StyledBreadcrumbs = styled(EdsBreadcrumbs)`
  padding-top: 0.2em;
  width: auto;
  height: 1.5rem;
  overflow: clip;
`;

const Title = styled.p`
  line-height: 1rem;
  padding-left: 1rem;
  color: ${colors.interactive.primaryResting};
  font-size: 1rem;
  font-family: "EquinorBold";
  min-width: 143px;
`;

const BreadcrumbsContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  height: 2.5rem;
`;
