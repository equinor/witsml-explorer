import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import MudLog from "../../models/mudLog";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface MudLogRow extends ContentTableRow {
  message: MudLog;
}

export const MudLogsListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);

  const { selectedWellbore } = navigationState;
  const [mudLogs, setMudLogs] = useState<MudLog[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.mudLogs) {
      setMudLogs(selectedWellbore.mudLogs);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return mudLogs.map((msg) => {
      return {
        id: msg.uid,
        uid: msg.uid
      };
    });
  };

  const columns: ContentTableColumn[] = [{ property: "uid", label: "uid", type: ContentType.String }];

  return Object.is(selectedWellbore?.mudLogs, mudLogs) && <ContentTable columns={columns} data={getTableData()} />;
};

export default MudLogsListView;
