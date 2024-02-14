import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { MILLIS_IN_SECOND, SECONDS_IN_MINUTE } from "../components/Constants";
import { CurveValuesView } from "../components/ContentViews/CurveValuesView";
import JobsView from "../components/ContentViews/JobsView";
import LogCurveInfoListView from "../components/ContentViews/LogCurveInfoListView";
import LogTypeListView from "../components/ContentViews/LogTypeListView";
import LogsListView from "../components/ContentViews/LogsListView";
import { ObjectView } from "../components/ContentViews/ObjectView";
import { ObjectsListView } from "../components/ContentViews/ObjectsListView";
import QueryView from "../components/ContentViews/QueryView";
import ServerManager from "../components/ContentViews/ServerManager";
import WellboreObjectTypesListView from "../components/ContentViews/WellboreObjectTypesListView";
import WellboresListView from "../components/ContentViews/WellboresListView";
import WellsListView from "../components/ContentViews/WellsListView";
import AuthRoute from "./AuthRoute";
import Root from "./Root";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
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
    children: [
      { index: true, element: <ServerManager /> },
      {
        path: "servers/:serverUrl",
        element: <AuthRoute />,
        children: [
          {
            path: "wells",
            // loader: wellsLoader(queryClient),
            element: <WellsListView />
          },
          {
            path: "wells/:wellUid/wellbores",
            element: <WellboresListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups",
            element: <WellboreObjectTypesListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects",
            element: <ObjectsListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects/:objectUid",
            element: <ObjectView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/",
            element: <LogTypeListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects",
            element: <LogsListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid",
            element: <LogCurveInfoListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid/curvevalues",
            element: <CurveValuesView />
          },
          {
            path: "jobs",
            element: <JobsView />
          },
          {
            path: "query",
            element: <QueryView />
          }
        ]
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
