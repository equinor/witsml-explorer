import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ObjectsListView } from "../components/ContentViews/ObjectsListView";
import ServerManager from "../components/ContentViews/ServerManager";
import WellboreObjectTypesListView from "../components/ContentViews/WellboreObjectTypesListView";
import WellboresListView from "../components/ContentViews/WellboresListView";
import WellsListView from "../components/ContentViews/WellsListView";
import { ObjectsDataLoader } from "../components/DataLoaders/ObjectsDataLoader";
import { WellDataLoader } from "../components/DataLoaders/WellDataLoader";
import { WellboreObjectTypesDataLoader } from "../components/DataLoaders/WellboreObjectTypesDataLoader";
import { WellsDataLoader } from "../components/DataLoaders/WellsDataLoader";
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
          {
            path: "wells",
            element: <WellsDataLoader />,
            children: [
              {
                index: true,
                element: <WellsListView />
              },
              {
                path: ":wellUid/wellbores",
                element: <WellDataLoader />,
                children: [
                  { index: true, element: <WellboresListView /> },
                  {
                    path: ":wellboreUid/objectgroups",
                    element: <WellboreObjectTypesDataLoader />,
                    children: [
                      {
                        index: true,
                        element: <WellboreObjectTypesListView />
                      },
                      {
                        path: ":objectGroup/objects",
                        element: <ObjectsDataLoader />,
                        children: [
                          {
                            index: true,
                            element: <ObjectsListView />
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
        // children: [
        //   // { index: true, element: <Navigate to={"wells"} /> },
        //   {
        //     index: "wells",
        //     element: <WellDataLoader />,
        //     children: [
        //       {
        //         path: "wells",
        //         element: <h1>Hello World</h1>
        //       }
        //     ]
        //   }
        // ]
        // {
        //   children: [
        //     {
        //       index: true,
        //       element: <WellsListView />
        //     },
        //     {
        //       path: "wells/:wellUid/wellbores",
        //       element: <Outlet />,
        //       children: [
        //         {
        //           index: true,
        //           element: <WellboresListView />
        //         }
        //       ]
        //     }
        //   ]
        // }

        // {
        //   path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups",
        //   element: <WellboreObjectTypesListView />
        // },
        // {
        //   path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects",
        //   element: <ObjectsListView />
        // },
        // {
        //   path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects/:objectUid",
        //   element: <ObjectView />
        // },
        // {
        //   path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/",
        //   element: <LogTypeListView />
        // },
        // {
        //   path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects",
        //   element: <LogsListView />
        // },
        // {
        //   path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid",
        //   element: <LogCurveInfoListView />
        // },
        // {
        //   path: "wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid/curvevalues",
        //   element: <CurveValuesView />
        // },
        // {
        //   path: "jobs",
        //   element: <JobsView />
        // },
        // { path: "query", element: <QueryView />
      }
    ]
  }
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
