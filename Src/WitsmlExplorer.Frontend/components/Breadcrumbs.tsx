import { Breadcrumbs as EdsBreadcrumbs } from "@equinor/eds-core-react";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetComponents } from "hooks/query/useGetComponents.tsx";
import { useGetObject } from "hooks/query/useGetObject";
import { useGetWell } from "hooks/query/useGetWell";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { useGetActiveRoute } from "hooks/useGetActiveRoute";
import { useOperationState } from "hooks/useOperationState";
import { capitalize } from "lodash";
import { ComponentType, ComponentTypeToModel } from "models/componentType.ts";
import DataSourceConfigurationSet, {
  getLastDataSourceConfiguration
} from "models/dataWorkOrder/dataSourceConfigurationSet.ts";
import {
  ObjectType,
  ObjectTypeToModel,
  pluralizeObjectType
} from "models/objectType";
import { Server } from "models/server";
import Well from "models/well";
import Wellbore from "models/wellbore";
import { useEffect, useState } from "react";
import {
  createSearchParams,
  NavigateFunction,
  NavLink,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import {
  getComponentViewPath,
  getLogObjectsViewPath,
  getLogObjectViewPath,
  getLogTypesViewPath,
  getMultiLogCurveInfoListViewPath,
  getObjectGroupsViewPath,
  getObjectsViewPath,
  getObjectViewPath,
  getWellboresViewPath,
  getWellsViewPath
} from "routes/utils/pathBuilder";
import styled, { css } from "styled-components";
import { colors } from "styles/Colors";
import Icon from "styles/Icons";
import { v4 as uuid } from "uuid";
import { UserTheme } from "../contexts/operationStateReducer.tsx";

export function Breadcrumbs() {
  const {
    operationState: { colors, theme }
  } = useOperationState();
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
    isComponentView,
    isLogTypesView,
    isLogObjectsView,
    isLogObjectView,
    isLogCurveValuesView,
    isMultiLogsCurveInfoListView,
    isMultiLogCurveValuesView,
    isDataSourceConfigurationView
  } = useGetActiveRoute();

  const {
    serverUrl,
    wellUid,
    wellboreUid,
    objectGroup,
    objectUid,
    logType,
    componentGroup,
    componentUid,
    dataSourceConfigurationUid
  } = useParams();
  const [searchParams] = useSearchParams();
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
  const { components } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    componentGroup as ComponentType
  );
  const component = components?.find((c) => c.uid === componentUid);

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
      ),
      getComponentCrumb(
        serverUrl,
        objectGroup,
        object,
        componentGroup,
        component,
        navigate,
        isComponentView
      ),
      getLogCurveValuesCrumb(isLogCurveValuesView),
      getMultiLogsCurveInfoListCrumb(
        serverUrl,
        objectGroup,
        wellbore,
        logType,
        navigate,
        isMultiLogsCurveInfoListView,
        isMultiLogCurveValuesView,
        searchParams
      ),
      getMultiLogCurveValuesCrumb(isMultiLogCurveValuesView),
      getDataSourceConfigurationCrumb(
        component as DataSourceConfigurationSet,
        dataSourceConfigurationUid,
        isDataSourceConfigurationView
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
    component,
    logType,
    isJobsView,
    isQueryView,
    isSearchView,
    isLogCurveValuesView,
    isMultiLogsCurveInfoListView,
    isMultiLogCurveValuesView,
    isDataSourceConfigurationView
  ]);

  return (
    <BreadcrumbsContainer>
      <StyledNavLink to={"/"}>
        <Title style={{ color: colors.infographic.primaryMossGreen }}>
          WITSML Explorer
        </Title>
      </StyledNavLink>
      {breadcrumbContent.length !== 0 && (
        <Icon
          name="chevronRight"
          color={colors.text.staticIconsTertiary}
          size={18}
          style={{ minWidth: "18" }}
        />
      )}
      <StyledBreadcrumbs
        color="inherit"
        aria-label="breadcrumb"
        wrap={false}
        $isCompact={theme === UserTheme.Compact}
      >
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

const getComponentCrumb = <T extends ComponentType>(
  serverUrl: string,
  objectGroup: string,
  object: ObjectTypeToModel[ObjectType],
  componentGroup: string,
  component: ComponentTypeToModel[T],
  navigate: NavigateFunction,
  isComponentView: boolean
) => {
  if (
    !serverUrl ||
    !objectGroup ||
    !object ||
    !componentGroup ||
    !component ||
    componentGroup !== ComponentType.DataSourceConfigurationSet
  )
    return {};
  // Need special handling for each component as they don't have a common name property.
  // Currently only DataSourceConfigurationSet has it's own component view.
  const lastConfig = getLastDataSourceConfiguration(
    component as DataSourceConfigurationSet
  );
  return {
    name: `${lastConfig?.name} Versions`,
    onClick: () => {
      if (isComponentView) return;
      navigate(
        getComponentViewPath(
          serverUrl,
          object.wellUid,
          object.wellboreUid,
          objectGroup,
          object.uid,
          componentGroup,
          component.uid
        )
      );
    }
  };
};

const getLogCurveValuesCrumb = (isLogCurveValuesView: boolean) => {
  return isLogCurveValuesView ? { name: "Data" } : {};
};

const getMultiLogsCurveInfoListCrumb = (
  serverUrl: string,
  objectGroup: string,
  wellbore: Wellbore,
  logType: string,
  navigate: NavigateFunction,
  isMultiLogsCurveInfoListView: boolean,
  isMultiLogCurveValuesView: boolean,
  searchParams: URLSearchParams
) => {
  let newSearchParams: URLSearchParams = null;
  if (isMultiLogCurveValuesView) {
    const logMnemonics = searchParams.get("mnemonics");
    if (logMnemonics) {
      const logUids = Object.keys(JSON.parse(logMnemonics));
      const logUidsFormatted = JSON.stringify(logUids);
      newSearchParams = createSearchParams({ logs: logUidsFormatted });
    }
  }
  return isMultiLogsCurveInfoListView || isMultiLogCurveValuesView
    ? {
        name: "Multiple logs",
        onClick: () => {
          if (isMultiLogsCurveInfoListView || !newSearchParams) return;
          navigate({
            pathname: getMultiLogCurveInfoListViewPath(
              serverUrl,
              wellbore.wellUid,
              wellbore.uid,
              objectGroup,
              logType
            ),
            search: newSearchParams.toString()
          });
        }
      }
    : {};
};

const getMultiLogCurveValuesCrumb = (isMultiLogCurveValuesView: boolean) => {
  return isMultiLogCurveValuesView ? { name: "Multi Data" } : {};
};

const getDataSourceConfigurationCrumb = (
  component: DataSourceConfigurationSet,
  dataSourceConfigurationUid: string,
  isDataSourceConfigurationView: boolean
) => {
  const config = component?.dataSourceConfigurations?.find(
    (c) => c.uid === dataSourceConfigurationUid
  );
  return isDataSourceConfigurationView
    ? { name: `Version ${config?.versionNumber}` }
    : {};
};

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

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
`;

const StyledBreadcrumbs = styled(EdsBreadcrumbs)<{ $isCompact: boolean }>`
  overflow: clip;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: fit-content;

  li > span {
    display: inline-flex;
    line-height: 16px;
  }

  ${({ $isCompact }) =>
    !$isCompact
      ? ""
      : css`
          li > span {
            font-size: 0.8rem;
          }

          li > p {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        `}
`;

const Title = styled.p`
  line-height: 1rem;
  padding-left: 1rem;
  color: ${colors.interactive.primaryResting};
  font-size: 1rem;
  font-family: "EquinorBold";
  min-width: max-content;
`;

const BreadcrumbsContainer = styled.div`
  display: flex;
  align-items: center;
  height: 2.5rem;
  min-width: 0;
  overflow: clip;
`;
