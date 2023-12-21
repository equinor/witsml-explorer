import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";

// const objectGroupViews: Record<ObjectType, ReactElement> = {
//   [ObjectType.BhaRun]: <BhaRunsListView />,
//   [ObjectType.ChangeLog]: <ChangeLogsListView />,
//   [ObjectType.FluidsReport]: <FluidsReportsListView />,
//   [ObjectType.FormationMarker]: <FormationMarkersListView />,
//   [ObjectType.Log]: <LogTypeListView />,
//   [ObjectType.Message]: <MessagesListView />,
//   [ObjectType.MudLog]: <MudLogsListView />,
//   [ObjectType.Rig]: <RigsListView />,
//   [ObjectType.Risk]: <RisksListView />,
//   [ObjectType.Trajectory]: <TrajectoriesListView />,
//   [ObjectType.Tubular]: <TubularsListView />,
//   [ObjectType.WbGeometry]: <WbGeometriesListView />
// };

// const objectViews: Partial<Record<ObjectType, ReactElement>> = {
//   [ObjectType.Log]: <LogCurveInfoListView />,
//   [ObjectType.MudLog]: <MudLogView />,
//   [ObjectType.Trajectory]: <TrajectoryView />,
//   [ObjectType.Tubular]: <TubularView />,
//   [ObjectType.WbGeometry]: <WbGeometryView />,
//   [ObjectType.FluidsReport]: <FluidsView />
// };

const ContentView = (): React.ReactElement => {
  // const { navigationState } = useContext(NavigationContext);
  // const {
  //   selectedWell,
  //   selectedWellbore,
  //   selectedLogTypeGroup,
  //   selectedLogCurveInfo,
  //   selectedObjectGroup,
  //   selectedObject,
  //   selectedServer,
  //   currentSelected
  // } = navigationState;
  // const [view, setView] = useState(<WellsListView />);

  // useEffect(() => {
  //   const setObjectView = (isGroup: boolean): void => {
  //     const views = isGroup ? objectGroupViews : objectViews;
  //     const view = views[selectedObjectGroup as ObjectType];
  //     if (view != null) {
  //       setView(view);
  //     } else {
  //       throw new Error(
  //         `No ${
  //           isGroup ? "group" : "object"
  //         } view is implemented for item: ${JSON.stringify(
  //           selectedObjectGroup
  //         )}`
  //       );
  //     }
  //   };

  //   if (currentSelected === null) {
  //     setView(<ServerManager />);
  //   } else {
  //     if (currentSelected === selectedServer) {
  //       setView(<WellsListView />);
  //     } else if (currentSelected === selectedWell) {
  //       setView(<WellboresListView />);
  //     } else if (currentSelected === selectedWellbore) {
  //       setView(<WellboreObjectTypesListView />);
  //     } else if (currentSelected === selectedObjectGroup) {
  //       setObjectView(true);
  //     } else if (currentSelected === selectedLogTypeGroup) {
  //       setView(<LogsListView />);
  //     } else if (currentSelected === selectedObject) {
  //       setObjectView(false);
  //     } else if (currentSelected === selectedLogCurveInfo) {
  //       setView(<CurveValuesView />);
  //     } else if (currentSelected === ViewFlags.Jobs) {
  //       setView(<JobsView />);
  //     } else if (currentSelected === ViewFlags.Query) {
  //       setView(<QueryView />);
  //     } else if (currentSelected === ViewFlags.ServerManager) {
  //       setView(<ServerManager />);
  //     } else if (currentSelected === ViewFlags.ObjectSearchView) {
  //       setView(<ObjectSearchListView />);
  //     } else {
  //       throw new Error(
  //         `No view is implemented for item: ${JSON.stringify(currentSelected)}`
  //       );
  //     }
  //   }
  // }, [currentSelected]);

  return (
    <ContentPanel>
      <Outlet />
    </ContentPanel>
  );
};

const ContentPanel = styled.div`
  height: 100%;
`;

export default ContentView;
