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
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import FluidsReport from "models/fluidsReport";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import { MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getObjectViewPath } from "routes/utils/pathBuilder";

export interface FluidsReportRow extends ContentTableRow, FluidsReport {
  fluidsReport: FluidsReport;
}

export default function FluidsReportsListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const { wellUid, wellboreUid } = useParams();
  const navigate = useNavigate();
  const { objects: fluidsReports } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.FluidsReport
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.FluidsReport);

  const getTableData = () => {
    return fluidsReports.map((fluidsReport) => {
      return {
        ...fluidsReport,
        ...fluidsReport.commonData,
        id: fluidsReport.uid,
        fluidsReport: fluidsReport,
        md: measureToString(fluidsReport.md),
        tvd: measureToString(fluidsReport.tvd),
        dTim: formatDateString(fluidsReport.dTim, timeZone, dateTimeFormat),
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
    { property: "dTim", label: "dTim", type: ContentType.DateTime },
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
    navigate(
      getObjectViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        ObjectType.FluidsReport,
        fluidsReportRow.fluidsReport.uid
      )
    );
  };

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedFluidsReportRows: FluidsReportRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedFluidsReportRows.map((row) => row.fluidsReport)
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
    fluidsReports && (
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
}
