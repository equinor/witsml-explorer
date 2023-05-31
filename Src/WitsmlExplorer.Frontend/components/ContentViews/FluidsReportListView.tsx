import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import FluidsReport from "../../models/fluidsReport";
import { measureToString } from "../../models/measure";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import FluidsReportContextMenu from "../ContextMenus/FluidsReportContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface FluidsReportRow extends ContentTableRow, FluidsReport {
  fluidsReport: FluidsReport;
}

export const FluidsReportsListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const [fluidsReports, setFluidsReports] = useState<FluidsReport[]>([]);

  useEffect(() => {
    if (selectedWellbore?.fluidsReports) {
      setFluidsReports(selectedWellbore.fluidsReports);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return fluidsReports.map((fluidsReport) => {
      return {
        ...fluidsReport,
        ...fluidsReport.commonData,
        id: fluidsReport.uid,
        fluidsReport: fluidsReport,
        md: measureToString(fluidsReport.md),
        tvd: measureToString(fluidsReport.tvd),
        dTimCreation: formatDateString(fluidsReport.commonData.dTimCreation, timeZone),
        dTimLastChange: formatDateString(fluidsReport.commonData.dTimLastChange, timeZone)
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "dTim", label: "dTim", type: ContentType.String },
    { property: "md", label: "md", type: ContentType.Measure },
    { property: "tvd", label: "tvd", type: ContentType.Measure },
    { property: "numReport", label: "numReport", type: ContentType.String },
    { property: "dTimCreation", label: "dTimCreation", type: ContentType.DateTime },
    { property: "dTimLastChange", label: "dTimLastChange", type: ContentType.DateTime },
    { property: "itemState", label: "itemState", type: ContentType.String },
    { property: "comments", label: "comments", type: ContentType.String },
    { property: "defaultDatum", label: "defaultDatum", type: ContentType.String }
  ];

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedFluidsReportRows: FluidsReportRow[]) => {
    const contextProps: ObjectContextMenuProps = { checkedObjects: checkedFluidsReportRows.map((row) => row.fluidsReport), wellbore: selectedWellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <FluidsReportContextMenu {...contextProps} />, position } });
  };

  return Object.is(selectedWellbore?.fluidsReports, fluidsReports) && <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows />;
};

export default FluidsReportsListView;
