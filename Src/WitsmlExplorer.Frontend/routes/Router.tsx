import {
  Navigate,
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import { CurveValuesView } from "../components/ContentViews/CurveValuesView";
import JobsView from "../components/ContentViews/JobsView";
import { LogCurveInfoListView } from "../components/ContentViews/LogCurveInfoListView";
import LogTypeListView from "../components/ContentViews/LogTypeListView";
import LogsListView from "../components/ContentViews/LogsListView";
import { ObjectsListView } from "../components/ContentViews/ObjectsListView";
import QueryView from "../components/ContentViews/QueryView";
import ServerManager from "../components/ContentViews/ServerManager";
import WellboreObjectTypesListView from "../components/ContentViews/WellboreObjectTypesListView";
import WellboresListView from "../components/ContentViews/WellboresListView";
import WellsListView from "../components/ContentViews/WellsListView";
import AuthRoute from "./AuthRoute";
import Root from "./Root";

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
          { index: true, element: <Navigate to={"wells"} /> },
          { path: "wells", element: <WellsListView /> },
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
          { path: "query", element: <QueryView /> }
        ]
      }
    ]
  }
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
