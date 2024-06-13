import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import BhaRunContextMenu from "components/ContextMenus/BhaRunContextMenu";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import formatDateString from "components/DateFormatter";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import BhaRun from "models/bhaRun";
import { ObjectType } from "models/objectType";
import { MouseEvent } from "react";
import { useParams } from "react-router-dom";

export interface BhaRunRow extends ContentTableRow, BhaRun {
  bhaRun: BhaRun;
}

export default function BhaRunsListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const { wellUid, wellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { objects: bhaRuns } = useGetObjects(
    connectedServer,
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
      checkedObjects: checkedBhaRunRows.map((row) => row.bhaRun)
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
