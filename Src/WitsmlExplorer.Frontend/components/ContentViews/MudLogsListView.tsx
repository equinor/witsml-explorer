import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import MudLogContextMenu from "components/ContextMenus/MudLogContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import formatDateString from "components/DateFormatter";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { measureToString } from "models/measure";
import MudLog from "models/mudLog";
import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useState } from "react";

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
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const { selectedWell, selectedWellbore } = navigationState;
  const [mudLogs, setMudLogs] = useState<MudLog[]>([]);

  useEffect(() => {
    if (selectedWellbore?.mudLogs) {
      setMudLogs(selectedWellbore.mudLogs);
    }
  }, [selectedWellbore]);

  const onSelect = (mudLogRow: MudLogRow) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: {
        well: selectedWell,
        wellbore: selectedWellbore,
        object: mudLogRow.mudLog,
        objectType: ObjectType.MudLog
      }
    });
  };

  const getTableData = (): MudLogRow[] => {
    return mudLogs.map((mudLog) => {
      return {
        id: mudLog.uid,
        name: mudLog.name,
        mudLogCompany: mudLog.mudLogCompany,
        mudLogEngineers: mudLog.mudLogEngineers,
        startMd: measureToString(mudLog.startMd),
        endMd: measureToString(mudLog.endMd),
        dTimCreation: formatDateString(
          mudLog.commonData?.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          mudLog.commonData?.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        itemState: mudLog.commonData?.itemState,
        uid: mudLog.uid,
        mudLog
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    {
      property: "mudLogCompany",
      label: "mudLogCompany",
      type: ContentType.String
    },
    {
      property: "mudLogEngineers",
      label: "mudLogEngineers",
      type: ContentType.String
    },
    { property: "startMd", label: "startMd", type: ContentType.Measure },
    { property: "endMd", label: "endMd", type: ContentType.Measure },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    },
    {
      property: "itemState",
      label: "commonData.itemState",
      type: ContentType.String
    },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedRows: MudLogRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedRows.map((row) => row.mudLog),
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <MudLogContextMenu {...contextProps} />, position }
    });
  };

  return (
    Object.is(selectedWellbore?.mudLogs, mudLogs) && (
      <ContentTable
        viewId="mudLogsListView"
        columns={columns}
        data={getTableData()}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName="MudLogs"
      />
    )
  );
};

export default MudLogsListView;
