import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import MudLog from "../../models/mudLog";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface MudLogRow extends ContentTableRow {
  message: MudLog;
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

  const onSelect = (mudLog: any) => {
    dispatchNavigation({
      type: NavigationType.SelectMudLog,
      payload: { well: selectedWell, wellbore: selectedWellbore, mudLogGroup: selectedMudLogGroup, mudLog }
    });
  };

  const getTableData = () => {
    return mudLogs.map((msg) => {
      return {
        id: msg.uid,
        uid: msg.uid
      };
    });
  };

  const columns: ContentTableColumn[] = [{ property: "uid", label: "uid", type: ContentType.String }];

  return Object.is(selectedWellbore?.mudLogs, mudLogs) && <ContentTable columns={columns} data={getTableData()} onSelect={onSelect} />;
};

export default MudLogsListView;
