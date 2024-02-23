import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { MILLIS_IN_SECOND, SECONDS_IN_MINUTE } from "../components/Constants";
import { CurveValuesView } from "../components/ContentViews/CurveValuesView";
import { ErrorView } from "../components/ContentViews/ErrorView";
import JobsView from "../components/ContentViews/JobsView";
import LogCurveInfoListView from "../components/ContentViews/LogCurveInfoListView";
import LogTypeListView from "../components/ContentViews/LogTypeListView";
import LogsListView from "../components/ContentViews/LogsListView";
import ObjectSearchListView from "../components/ContentViews/ObjectSearchListView";
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
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      gcTime: 30 * SECONDS_IN_MINUTE * MILLIS_IN_SECOND // The duration unused items are kept in the cache before garbage collection.
    }
  }
});

// TODO: Handle navigating to not-existing objects.
// TODO: Also make sure that we navigate to the parent if we are viewing a object, and then delete it.
const router = createBrowserRouter([
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
        path: "servers/:serverUrl",
        element: <AuthRoute />,
        errorElement: <ErrorView />,
        children: [
          {
            path: "wells",
            element: <WellsListView />,
            errorElement: <ErrorView />
          },
          {
            path: "wells/:wellUid/wellbores",
            element: <WellboresListView />,
            errorElement: <ErrorView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups",
            element: <WellboreObjectTypesListView />,
            errorElement: <ErrorView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects",
            element: <ObjectsListView />,
            errorElement: <ErrorView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects/:objectUid",
            element: <ObjectView />,
            errorElement: <ErrorView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/",
            element: <LogTypeListView />,
            errorElement: <ErrorView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects",
            element: <LogsListView />,
            errorElement: <ErrorView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid",
            element: <LogCurveInfoListView />,
            errorElement: <ErrorView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid/curvevalues",
            element: <CurveValuesView />,
            errorElement: <ErrorView />
          },
          {
            path: "jobs",
            element: <JobsView />,
            errorElement: <ErrorView />
          },
          {
            path: "query",
            element: <QueryView />,
            errorElement: <ErrorView />
          },
          {
            path: "search/:filterType",
            element: <ObjectSearchListView />,
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
