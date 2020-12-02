import React, { useContext } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { calculateLogGroupId, calculateLogTypeDepthId, calculateLogTypeTimeId } from "../../models/wellbore";

interface LogType {
  uid: number;
  name: string;
}

export const LogTypeListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore } = navigationState;

  const columns: ContentTableColumn[] = [{ property: "name", label: "Name", type: ContentType.String }];

  const logTypes: LogType[] = [
    { uid: 0, name: "Depth" },
    { uid: 1, name: "Time" }
  ];

  const onSelect = async (logType: any) => {
    const logTypeGroup = logType.uid === 0 ? calculateLogTypeDepthId(selectedWellbore) : calculateLogTypeTimeId(selectedWellbore);

    dispatchNavigation({
      type: NavigationType.SelectLogType,
      payload: {
        well: selectedWell,
        wellbore: selectedWellbore,
        logGroup: calculateLogGroupId(selectedWellbore),
        logTypeGroup: logTypeGroup
      }
    });
  };

  return <ContentTable columns={columns} data={logTypes} onSelect={onSelect} />;
};

export default LogTypeListView;
