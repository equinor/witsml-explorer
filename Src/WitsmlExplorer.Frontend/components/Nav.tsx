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
import OperationContext from "../contexts/operationContext";
import { ObjectType, pluralizeObjectType } from "../models/objectType";
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
  const [breadcrumbContent, setBreadcrumbContent] = useState([]);

  const createBreadcrumbContent = () => {
    const groupCrumbs = Object.keys(ObjectType).map((key) => {
      return getObjectGroupCrumb(
        key as ObjectType,
        serverUrl,
        wellUid,
        wellboreUid,
        objectGroup,
        navigate
      );
    });
    return [
      getServerCrumb(serverUrl, navigate),
      getJobsCrumb(serverUrl, isJobsView, navigate),
      getQueryCrumb(serverUrl, isQueryView, navigate),
      getSearchCrumb(serverUrl, isSearchView, navigate),
      getWellCrumb(serverUrl, wellUid, navigate),
      getWellboreCrumb(serverUrl, wellUid, wellboreUid, navigate),
      ...groupCrumbs,
      getLogTypeCrumb(serverUrl, wellUid, wellboreUid, logType, navigate),
      getObjectCrumb(
        serverUrl,
        wellUid,
        wellboreUid,
        objectGroup,
        objectUid,
        logType,
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
    isJobsView,
    isQueryView
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

const getServerCrumb = (serverUrl: string, navigate: NavigateFunction) => {
  return serverUrl
    ? {
        name: serverUrl,
        onClick: () => {
          navigate(`servers/${encodeURIComponent(serverUrl)}/wells`);
        }
      }
    : {};
};

const getWellCrumb = (
  serverUrl: string,
  wellUid: string,
  navigate: NavigateFunction
) => {
  return serverUrl && wellUid
    ? {
        name: wellUid,
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
  navigate: NavigateFunction
) => {
  return serverUrl && wellUid && wellboreUid
    ? {
        name: wellboreUid,
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
  navigate: NavigateFunction
) => {
  const pluralizedObjectType = pluralizeObjectType(objectType);
  return serverUrl && wellUid && wellboreUid && objectGroup === objectType
    ? {
        name: pluralizedObjectType,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(
              serverUrl
            )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${objectGroup}/${
              objectGroup === ObjectType.Log ? "logtypes" : "objects"
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
            )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${
              ObjectType.Log
            }/logtypes/${logType}/objects`
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
  navigate: NavigateFunction
) => {
  return serverUrl && wellUid && wellboreUid && objectGroup && objectUid
    ? {
        name: objectUid,
        onClick: () => {
          navigate(
            `servers/${encodeURIComponent(
              serverUrl
            )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${objectGroup}/${
              logType ? `logtypes/${logType}/` : ""
            }objects/${objectUid}`
          );
        }
      }
    : {};
};

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
