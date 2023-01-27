import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import MudLog from "../../models/mudLog";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface MudLogRow extends ContentTableRow {
  mudLog: MudLog;
  name: string;
  uid: string;
}

export const MudLogsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);

  const { selectedWell, selectedWellbore, selectedMudLogGroup } = navigationState;
  const [mudLogs, setMudLogs] = useState<MudLog[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.mudLogs) {
      setMudLogs(selectedWellbore.mudLogs);
    }
  }, [selectedWellbore]);

  const onSelect = (mudLogRow: MudLogRow) => {
    dispatchNavigation({
      type: NavigationType.SelectMudLog,
      payload: { well: selectedWell, wellbore: selectedWellbore, mudLogGroup: selectedMudLogGroup, mudLog: mudLogRow.mudLog }
    });
  };

  const getTableData = (): MudLogRow[] => {
    return mudLogs.map((mudLog, index) => {
      return {
        id: index,
        name: mudLog.name,
        uid: mudLog.uid,
        mudLog
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  return Object.is(selectedWellbore?.mudLogs, mudLogs) && <ContentTable columns={columns} data={getTableData()} onSelect={onSelect} />;
};

export default MudLogsListView;
