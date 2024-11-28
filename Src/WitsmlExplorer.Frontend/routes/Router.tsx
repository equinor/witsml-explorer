import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MultiLogCurveValuesView } from "components/ContentViews/MultiLogCurveValuesView";
import MultiLogsCurveInfoListView from "components/ContentViews/MultiLogsCurveInfoListView";
import { SearchListView } from "components/ContentViews/SearchListView";
import {
  RouterProvider,
  createBrowserRouter,
  createHashRouter
} from "react-router-dom";
import {
  JOBS_VIEW_ROUTE_PATH,
  LOG_CURVE_VALUES_VIEW_ROUTE_PATH,
  LOG_OBJECTS_VIEW_ROUTE_PATH,
  LOG_OBJECT_VIEW_ROUTE_PATH,
  LOG_TYPES_VIEW_ROUTE_PATH,
  MULTI_LOGS_CURVE_INFO_LIST_VIEW_ROUTE_PATH,
  MULTI_LOGS_CURVE_VALUES_ROUTE_PATH,
  OBJECTS_VIEW_ROUTE_PATH,
  OBJECT_GROUPS_VIEW_ROUTE_PATH,
  OBJECT_VIEW_ROUTE_PATH,
  QUERY_VIEW_ROUTE_PATH,
  SEARCH_VIEW_ROUTE_PATH,
  SERVER_ROUTE_PATH,
  WELLSBORES_VIEW_ROUTE_PATH,
  WELLS_VIEW_ROUTE_PATH
} from "routes/routerConstants";
import { isDesktopApp } from "tools/desktopAppHelpers";
import { MILLIS_IN_SECOND, SECONDS_IN_MINUTE } from "../components/Constants";
import { CurveValuesView } from "../components/ContentViews/CurveValuesView";
import { ErrorView } from "../components/ContentViews/ErrorView";
import JobsView from "../components/ContentViews/JobsView";
import LogCurveInfoListView from "../components/ContentViews/LogCurveInfoListView";
import LogTypeListView from "../components/ContentViews/LogTypeListView";
import LogsListView from "../components/ContentViews/LogsListView";
import { ObjectView } from "../components/ContentViews/ObjectView";
import { ObjectsListView } from "../components/ContentViews/ObjectsListView";
import QueryView from "../components/ContentViews/QueryView";
import ServerManager from "../components/ContentViews/ServerManager";
import { ViewNotFound } from "../components/ContentViews/ViewNotFound";
import WellboreObjectTypesListView from "../components/ContentViews/WellboreObjectTypesListView";
import WellboresListView from "../components/ContentViews/WellboresListView";
import WellsListView from "../components/ContentViews/WellsListView";
import AuthRoute from "./AuthRoute";
import { ErrorPage } from "./ErrorPage";
import { PageNotFound } from "./PageNotFound";
import Root from "./Root";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * SECONDS_IN_MINUTE * MILLIS_IN_SECOND,
      retry: 0,
      gcTime: 30 * SECONDS_IN_MINUTE * MILLIS_IN_SECOND // The duration unused items are kept in the cache before garbage collection.
    }
  }
});

const createRouter = isDesktopApp() ? createHashRouter : createBrowserRouter;

const router = createRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ServerManager />,
        errorElement: <ErrorView />
      },
      {
        path: SERVER_ROUTE_PATH,
        element: <AuthRoute />,
        errorElement: <ErrorView />,
        children: [
          {
            path: WELLS_VIEW_ROUTE_PATH,
            element: <WellsListView />,
            errorElement: <ErrorView />
          },
          {
            path: WELLSBORES_VIEW_ROUTE_PATH,
            element: <WellboresListView />,
            errorElement: <ErrorView />
          },
          {
            path: OBJECT_GROUPS_VIEW_ROUTE_PATH,
            element: <WellboreObjectTypesListView />,
            errorElement: <ErrorView />
          },
          {
            path: OBJECTS_VIEW_ROUTE_PATH,
            element: <ObjectsListView />,
            errorElement: <ErrorView />
          },
          {
            path: OBJECT_VIEW_ROUTE_PATH,
            element: <ObjectView />,
            errorElement: <ErrorView />
          },
          {
            path: LOG_TYPES_VIEW_ROUTE_PATH,
            element: <LogTypeListView />,
            errorElement: <ErrorView />
          },
          {
            path: LOG_OBJECTS_VIEW_ROUTE_PATH,
            element: <LogsListView />,
            errorElement: <ErrorView />
          },
          {
            path: LOG_OBJECT_VIEW_ROUTE_PATH,
            element: <LogCurveInfoListView />,
            errorElement: <ErrorView />
          },
          {
            path: LOG_CURVE_VALUES_VIEW_ROUTE_PATH,
            element: <CurveValuesView />,
            errorElement: <ErrorView />
          },
          {
            path: MULTI_LOGS_CURVE_INFO_LIST_VIEW_ROUTE_PATH,
            element: <MultiLogsCurveInfoListView />,
            errorElement: <ErrorView />
          },
          {
            path: MULTI_LOGS_CURVE_VALUES_ROUTE_PATH,
            element: <MultiLogCurveValuesView />,
            errorElement: <ErrorView />
          },
          {
            path: JOBS_VIEW_ROUTE_PATH,
            element: <JobsView />,
            errorElement: <ErrorView />
          },
          {
            path: QUERY_VIEW_ROUTE_PATH,
            element: <QueryView />,
            errorElement: <ErrorView />
          },
          {
            path: SEARCH_VIEW_ROUTE_PATH,
            element: <SearchListView />,
            errorElement: <ErrorView />
          },
          {
            path: "*",
            element: <ViewNotFound />
          }
        ]
      },
      {
        path: "*",
        element: <PageNotFound />
      }
    ]
  }
]);

export default function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
