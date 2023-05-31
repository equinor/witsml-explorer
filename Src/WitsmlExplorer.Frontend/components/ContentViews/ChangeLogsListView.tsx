import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import ChangeLog from "../../models/changeLog";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const ChangeLogsListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);

  useEffect(() => {
    if (selectedWellbore?.changeLogs) {
      setChangeLogs(selectedWellbore.changeLogs);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return changeLogs.map((changeLog, index) => {
      return {
        id: index,
        uidObject: changeLog.uidObject,
        nameObject: changeLog.nameObject,
        lastChangeType: changeLog.lastChangeType,
        dTimCreation: formatDateString(changeLog.commonData.dTimCreation, timeZone),
        dTimLastChange: formatDateString(changeLog.commonData.dTimLastChange, timeZone)
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "uidObject", label: "uidObject", type: ContentType.String },
    { property: "nameObject", label: "nameObject", type: ContentType.String },
    { property: "lastChangeType", label: "lastChangeType", type: ContentType.DateTime },
    { property: "dTimCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
    { property: "dTimLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime }
  ];

  return Object.is(selectedWellbore?.changeLogs, changeLogs) && <ContentTable columns={columns} data={getTableData()} />;
};

export default ChangeLogsListView;
