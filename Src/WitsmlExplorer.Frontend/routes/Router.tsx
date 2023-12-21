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
import Root from "./Root";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <ServerManager /> },

      { path: "servers/:serverUrl/wells", element: <WellsListView /> },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores",
        element: <WellboresListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid",
        element: <WellboreObjectTypesListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/bharuns",
        element: <BhaRunsListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/changelogs",
        element: <ChangeLogsListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/fluidsreports",
        element: <FluidsReportsListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/formationmarkers",
        element: <FormationMarkersListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/logs",
        element: <LogTypeListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/logs/depth",
        element: <LogsListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/logs/time",
        element: <LogsListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/logs/depth/:logUid",
        element: <LogCurveInfoListView />
      },
      {
        path: "servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/logs/time/:logUid",
        element: <LogCurveInfoListView />
      },
      {
        path: "servers/:serverUrl/jobs",
        element: <JobsView />
      },
      { path: "servers/:serverUrl/query", element: <QueryView /> }
    ]
  }
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
