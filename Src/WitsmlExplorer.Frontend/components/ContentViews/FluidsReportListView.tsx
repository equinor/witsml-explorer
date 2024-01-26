import { MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useExpandObjectsGroupNodes } from "../../hooks/useExpandObjectGroupNodes";
import { useGetObjects } from "../../hooks/useGetObjects";
import FluidsReport from "../../models/fluidsReport";
import { measureToString } from "../../models/measure";
import { ObjectType } from "../../models/objectType";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import FluidsReportContextMenu from "../ContextMenus/FluidsReportContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface FluidsReportRow extends ContentTableRow, FluidsReport {
  fluidsReport: FluidsReport;
}

export default function FluidsReportsListView() {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWell, selectedWellbore } = navigationState;
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { wellUid, wellboreUid } = useParams();

  const fluidsReports = useGetObjects(
    wellUid,
    wellboreUid,
    ObjectType.FluidsReport
  ) as FluidsReport[];

  useExpandObjectsGroupNodes(wellUid, wellboreUid, ObjectType.FluidsReport);

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
    navigate(
      `/servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        selectedWell.uid
      }/wellbores/${selectedWellbore.uid}/objectgroups/fluidsreports/objects/${
        fluidsReportRow.fluidsReport.uid
      }`
    );
  };

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
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
