import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import { measureToString } from "../../models/measure";
import MudLog from "../../models/mudLog";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface MudLogRow extends ContentTableRow {
  mudLog: MudLog;
  name: string;
  mudLogCompany: string;
  mudLogEngineers: string;
  startMd: string;
  endMd: string;
  dTimCreation: string;
  dTimLastChange: string;
  uid: string;
}

export const MudLogsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);

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
        mudLogCompany: mudLog.mudLogCompany,
        mudLogEngineers: mudLog.mudLogEngineers,
        startMd: measureToString(mudLog.startMd),
        endMd: measureToString(mudLog.endMd),
        dTimCreation: formatDateString(mudLog.commonData.dTimCreation, timeZone),
        dTimLastChange: formatDateString(mudLog.commonData.dTimLastChange, timeZone),
        uid: mudLog.uid,
        mudLog
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "mudLogCompany", label: "mudLogCompany", type: ContentType.String },
    { property: "mudLogEngineers", label: "mudLogEngineers", type: ContentType.String },
    { property: "startMd", label: "startMd", type: ContentType.String },
    { property: "endMd", label: "endMd", type: ContentType.String },
    { property: "dTimCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
    { property: "dTimLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  return Object.is(selectedWellbore?.mudLogs, mudLogs) && <ContentTable columns={columns} data={getTableData()} onSelect={onSelect} />;
};

export default MudLogsListView;
