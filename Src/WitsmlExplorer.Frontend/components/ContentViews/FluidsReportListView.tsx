import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import FluidsReportContextMenu from "components/ContextMenus/FluidsReportContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import formatDateString from "components/DateFormatter";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import FluidsReport from "models/fluidsReport";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useState } from "react";

export interface FluidsReportRow extends ContentTableRow, FluidsReport {
  fluidsReport: FluidsReport;
}

export const FluidsReportsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWell, selectedWellbore } = navigationState;
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
        dTimCreation: formatDateString(
          fluidsReport.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          fluidsReport.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        )
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "dTim", label: "dTim", type: ContentType.String },
    { property: "md", label: "md", type: ContentType.Measure },
    { property: "tvd", label: "tvd", type: ContentType.Measure },
    { property: "numReport", label: "numReport", type: ContentType.String },
    {
      property: "dTimCreation",
      label: "dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "dTimLastChange",
      type: ContentType.DateTime
    },
    { property: "itemState", label: "itemState", type: ContentType.String },
    { property: "comments", label: "comments", type: ContentType.String },
    {
      property: "defaultDatum",
      label: "defaultDatum",
      type: ContentType.String
    }
  ];

  const onSelect = (fluidsReportRow: FluidsReportRow) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: {
        well: selectedWell,
        wellbore: selectedWellbore,
        object: fluidsReportRow.fluidsReport,
        objectType: ObjectType.FluidsReport
      }
    });
  };

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedFluidsReportRows: FluidsReportRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedFluidsReportRows.map((row) => row.fluidsReport),
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <FluidsReportContextMenu {...contextProps} />,
        position
      }
    });
  };

  return (
    Object.is(selectedWellbore?.fluidsReports, fluidsReports) && (
      <ContentTable
        viewId="fluidsReportsListView"
        columns={columns}
        data={getTableData()}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName="FluidsReports"
      />
    )
  );
};

export default FluidsReportsListView;
