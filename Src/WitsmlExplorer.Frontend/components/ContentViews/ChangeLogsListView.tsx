import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import formatDateString from "components/DateFormatter";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import ChangeLog from "models/changeLog";
import React, { useContext, useEffect, useState } from "react";

export const ChangeLogsListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);

  useEffect(() => {
    if (selectedWellbore?.changeLogs) {
      setChangeLogs(selectedWellbore.changeLogs);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return changeLogs.map((changeLog) => {
      return {
        id: changeLog.uid,
        uidObject: changeLog.uidObject,
        nameObject: changeLog.nameObject,
        lastChangeType: changeLog.lastChangeType,
        dTimCreation: formatDateString(
          changeLog.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          changeLog.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        )
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "uidObject", label: "uidObject", type: ContentType.String },
    { property: "nameObject", label: "nameObject", type: ContentType.String },
    {
      property: "lastChangeType",
      label: "lastChangeType",
      type: ContentType.DateTime
    },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    }
  ];

  return (
    Object.is(selectedWellbore?.changeLogs, changeLogs) && (
      <ContentTable
        viewId="changeLogsListView"
        columns={columns}
        data={getTableData()}
        showRefresh
        downloadToCsvFileName="ChangeLogs"
      />
    )
  );
};

export default ChangeLogsListView;
