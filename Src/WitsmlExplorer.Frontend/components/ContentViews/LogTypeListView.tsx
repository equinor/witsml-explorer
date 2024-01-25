import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import {
  calculateLogTypeDepthId,
  calculateLogTypeTimeId
} from "models/wellbore";
import React, { useContext } from "react";

interface LogType {
  uid: number;
  name: string;
}

export const LogTypeListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore } = navigationState;

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
