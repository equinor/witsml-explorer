import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import RiskObject from "../../models/riskObject";
import { RiskObjectContextMenuProps } from "../ContextMenus/RiskContextMenu";
import OperationContext from "../../contexts/operationContext";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";
import RiskObjectContextMenu from "../ContextMenus/RiskContextMenu";

export interface RiskObjectRow extends ContentTableRow, RiskObject {
  risk: RiskObject;
}

export const RisksListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWellbore, selectedServer, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [risks, setRisks] = useState<RiskObject[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.risks) {
      setRisks(selectedWellbore.risks);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return risks.map((risk) => {
      return {
        ...risk,
        ...risk.commonData,
        id: risk.uid,
        mdBitStart: `${risk.mdBitStart?.value?.toFixed(4) ?? ""} ${risk.mdBitStart?.uom ?? ""}`,
        mdBitEnd: `${risk.mdBitEnd?.value?.toFixed(4) ?? ""} ${risk.mdBitEnd?.uom ?? ""}`,
        risk: risk
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "dTimCreation", label: "Created", type: ContentType.DateTime },
    { property: "dTimLastChange", label: "Last changed", type: ContentType.DateTime },
    { property: "name", label: "Name", type: ContentType.String },
    { property: "type", label: "Type", type: ContentType.String },
    { property: "category", label: "Category", type: ContentType.String },
    { property: "subCategory", label: "Sub Category", type: ContentType.String },
    { property: "extendCategory", label: "Extend Category", type: ContentType.String },
    { property: "affectedPersonnel", label: "Affected Personnel", type: ContentType.String },
    { property: "dTimStart", label: "Date Time start", type: ContentType.DateTime },
    { property: "dTimEnd", label: "Date Time end", type: ContentType.DateTime },
    { property: "mdBitStart", label: "mdBitStart", type: ContentType.String },
    { property: "mdBitEnd", label: "mdBitEnd", type: ContentType.String },
    { property: "severityLevel", label: "Severity Level", type: ContentType.String },
    { property: "probabilityLevel", label: "Probability Level", type: ContentType.String },
    { property: "summary", label: "Summary", type: ContentType.String },
    { property: "details", label: "Details", type: ContentType.String },
    { property: "itemState", label: "Item State", type: ContentType.String },
    { property: "sourceName", label: "Source Name", type: ContentType.String }
  ];
  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedRiskObjectRows: RiskObjectRow[]) => {
    const contextProps: RiskObjectContextMenuProps = { checkedRiskObjectRows, dispatchNavigation, dispatchOperation, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <RiskObjectContextMenu {...contextProps} />, position } });
  };

  return Object.is(selectedWellbore.risks, risks) && <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows />;
};

export default RisksListView;
