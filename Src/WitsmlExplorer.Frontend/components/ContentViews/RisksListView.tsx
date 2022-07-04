import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import RiskObject from "../../models/riskObject";

export interface RiskObjectRow extends ContentTableRow, RiskObject {}

export const RisksListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore } = navigationState;
  const [risks, setRisks] = useState<RiskObject[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.risks) {
      setRisks(selectedWellbore.risks);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return risks.map((risk) => {
      return { id: risk.uid, ...risk };
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

  return <ContentTable columns={columns} data={getTableData()} checkableRows />;
};

export default RisksListView;
