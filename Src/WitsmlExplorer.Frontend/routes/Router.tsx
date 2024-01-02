import { createBrowserRouter, RouterProvider } from "react-router-dom";
import BhaRunsListView from "../components/ContentViews/BhaRunsListView";
import ChangeLogsListView from "../components/ContentViews/ChangeLogsListView";
import FluidsReportsListView from "../components/ContentViews/FluidsReportListView";
import FormationMarkersListView from "../components/ContentViews/FormationMarkersListView";
import JobsView from "../components/ContentViews/JobsView";
import LogCurveInfoListView from "../components/ContentViews/LogCurveInfoListView";
import LogsListView from "../components/ContentViews/LogsListView";
import LogTypeListView from "../components/ContentViews/LogTypeListView";
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
          { path: "wells", element: <WellsListView /> },
          {
            path: "wells/:wellUid/wellbores",
            element: <WellboresListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid",
            element: <WellboreObjectTypesListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/bharuns",
            element: <BhaRunsListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/changelogs",
            element: <ChangeLogsListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/fluidsreports",
            element: <FluidsReportsListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/formationmarkers",
            element: <FormationMarkersListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/logs",
            element: <LogTypeListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/logs/:logType",
            element: <LogsListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/logs/:logType",
            element: <LogsListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/logs/:logType/:logUid",
            element: <LogCurveInfoListView />
          },
          {
            path: "wells/:wellUid/wellbores/:wellboreUid/logs/:logType/:logUid",
            element: <LogCurveInfoListView />
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
