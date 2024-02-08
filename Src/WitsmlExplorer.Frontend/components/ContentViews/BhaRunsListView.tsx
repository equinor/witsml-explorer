import { MouseEvent, useContext } from "react";
import { useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetObjects } from "../../hooks/query/useGetObjects";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import BhaRun from "../../models/bhaRun";
import { ObjectType } from "../../models/objectType";
import BhaRunContextMenu from "../ContextMenus/BhaRunContextMenu";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface BhaRunRow extends ContentTableRow, BhaRun {
  bhaRun: BhaRun;
}

export default function BhaRunsListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { wellUid, wellboreUid } = useParams();
  const { authorizationState } = useAuthorizationState();
  const { wellbore } = useGetWellbore(
    authorizationState?.server,
    wellUid,
    wellboreUid
  );

  const { objects: bhaRuns } = useGetObjects(
    authorizationState?.server,
    wellUid,
    wellboreUid,
    ObjectType.BhaRun
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.BhaRun);

  const getTableData = () => {
    return bhaRuns.map((bhaRun) => {
      return {
        ...bhaRun,
        ...bhaRun.commonData,
        id: bhaRun.uid,
        bhaRun: bhaRun,
        dTimStart: formatDateString(bhaRun.dTimStart, timeZone, dateTimeFormat),
        dTimStop: formatDateString(bhaRun.dTimStop, timeZone, dateTimeFormat),
        dTimStartDrilling: formatDateString(
          bhaRun.dTimStartDrilling,
          timeZone,
          dateTimeFormat
        ),
        dTimStopDrilling: formatDateString(
          bhaRun.dTimStopDrilling,
          timeZone,
          dateTimeFormat
        ),
        dTimCreation: formatDateString(
          bhaRun.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          bhaRun.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        tubular: bhaRun.tubular?.value
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "tubular", label: "tubular", type: ContentType.String },
    { property: "dTimStart", label: "dTimStart", type: ContentType.DateTime },
    { property: "dTimStop", label: "dTimStop", type: ContentType.DateTime },
    {
      property: "dTimStartDrilling",
      label: "dTimStartDrilling",
      type: ContentType.DateTime
    },
    {
      property: "dTimStopDrilling",
      label: "dTimStopDrilling",
      type: ContentType.DateTime
    },
    { property: "itemState", label: "itemState", type: ContentType.String },
    {
      property: "sourceName",
      label: "commonData.sourceName",
      type: ContentType.String
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

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedBhaRunRows: BhaRunRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedBhaRunRows.map((row) => row.bhaRun),
      wellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <BhaRunContextMenu {...contextProps} />, position }
    });
  };

  return (
    bhaRuns && (
      <ContentTable
        viewId="bhaRunsListView"
        columns={columns}
        data={getTableData()}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName="BhaRuns"
      />
    )
  );
}
