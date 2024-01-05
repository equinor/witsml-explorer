import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import {
  calculateLogTypeDepthId,
  calculateLogTypeTimeId
} from "../../models/wellbore";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

interface LogType {
  uid: number;
  name: string;
}

export const LogTypeListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore } = navigationState;
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  const logTypes: LogType[] = [
    { uid: 0, name: "Depth" },
    { uid: 1, name: "Time" }
  ];

  const onSelect = async (logType: any) => {
    const logTypeGroup =
      logType.uid === 0
        ? calculateLogTypeDepthId(selectedWellbore)
        : calculateLogTypeTimeId(selectedWellbore);

    dispatchNavigation({
      type: NavigationType.SelectLogType,
      payload: {
        well: selectedWell,
        wellbore: selectedWellbore,
        logTypeGroup: logTypeGroup
      }
    });
    navigate(
      `/servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        selectedWell.uid
      }/wellbores/${selectedWellbore.uid}/objectgroups/logs/logtypes/${
        logType.uid === 0 ? "depth" : "time"
      }/objects`
    );
  };

  return (
    <ContentTable
      columns={columns}
      data={logTypes}
      onSelect={onSelect}
      showPanel={false}
    />
  );
};

export default LogTypeListView;
