import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import BhaRun from "../../models/bhaRun";
import BhaRunContextMenu from "../ContextMenus/BhaRunContextMenu";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface BhaRunRow extends ContentTableRow, BhaRun {
  bhaRun: BhaRun;
}

export const BhaRunsListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const [bhaRuns, setBhaRuns] = useState<BhaRun[]>([]);

  useEffect(() => {
    if (selectedWellbore?.bhaRuns) {
      setBhaRuns(selectedWellbore.bhaRuns);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return bhaRuns.map((bhaRun) => {
      return {
        ...bhaRun,
        ...bhaRun.commonData,
        id: bhaRun.uid,
        bhaRun: bhaRun,
        dTimStart: formatDateString(bhaRun.dTimStart, timeZone),
        dTimStop: formatDateString(bhaRun.dTimStop, timeZone),
        dTimStartDrilling: formatDateString(bhaRun.dTimStartDrilling, timeZone),
        dTimStopDrilling: formatDateString(bhaRun.dTimStopDrilling, timeZone),
        dTimCreation: formatDateString(bhaRun.commonData.dTimCreation, timeZone),
        dTimLastChange: formatDateString(bhaRun.commonData.dTimLastChange, timeZone)
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "tubular", label: "tubular", type: ContentType.String },
    { property: "dTimStart", label: "dTimStart", type: ContentType.DateTime },
    { property: "dTimStop", label: "dTimStop", type: ContentType.DateTime },
    { property: "dTimStartDrilling", label: "dTimStartDrilling", type: ContentType.DateTime },
    { property: "dTimStopDrilling", label: "dTimStopDrilling", type: ContentType.DateTime },
    { property: "itemState", label: "itemState", type: ContentType.String },
    { property: "sourceName", label: "commonData.sourceName", type: ContentType.String },
    { property: "dTimCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
    { property: "dTimLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime }
  ];

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedBhaRunRows: BhaRunRow[]) => {
    const contextProps: ObjectContextMenuProps = { checkedObjects: checkedBhaRunRows.map((row) => row.bhaRun), wellbore: selectedWellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <BhaRunContextMenu {...contextProps} />, position } });
  };

  return Object.is(selectedWellbore?.bhaRuns, bhaRuns) && <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows />;
};

export default BhaRunsListView;
