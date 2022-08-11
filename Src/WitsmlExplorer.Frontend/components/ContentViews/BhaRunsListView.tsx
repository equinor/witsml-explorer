import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import BhaRun from "../../models/bhaRun";
import BhaRunContextMenu, { BhaRunContextMenuProps } from "../ContextMenus/BhaRunContextMenu";
import OperationContext from "../../contexts/operationContext";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";

export interface BhaRunRow extends ContentTableRow, BhaRun {
  bhaRun: BhaRun;
}

export const BhaRunsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWellbore, selectedServer, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [bhaRuns, setBhaRuns] = useState<BhaRun[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.bhaRuns) {
      setBhaRuns(selectedWellbore.bhaRuns);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return bhaRuns.map((bhaRun) => {
      return {
        ...bhaRun,
        ...bhaRun.commonData,
        id: bhaRun.uid,
        bhaRun: bhaRun
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "tubular", label: "Tubular", type: ContentType.String },
    { property: "dTimStart", label: "Date Time start", type: ContentType.DateTime },
    { property: "dTimStop", label: "Date Time stop", type: ContentType.DateTime },
    { property: "dTimStartDrilling", label: "Date Time start drilling", type: ContentType.DateTime },
    { property: "dTimStopDrilling", label: "Date Time stop drilling", type: ContentType.DateTime },
    { property: "itemState", label: "Item State", type: ContentType.String },
    { property: "sourceName", label: "Source Name", type: ContentType.String },
    { property: "dTimCreation", label: "Created", type: ContentType.DateTime },
    { property: "dTimLastChange", label: "Last changed", type: ContentType.DateTime }
  ];

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedBhaRunRows: BhaRunRow[]) => {
    const contextProps: BhaRunContextMenuProps = { checkedBhaRunRows, wellbore: selectedWellbore, dispatchNavigation, dispatchOperation, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <BhaRunContextMenu {...contextProps} />, position } });
  };

  return Object.is(selectedWellbore?.bhaRuns, bhaRuns) && <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows />;
};

export default BhaRunsListView;
