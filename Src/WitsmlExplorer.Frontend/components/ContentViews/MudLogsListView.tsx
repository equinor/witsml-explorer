import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import MudLogContextMenu from "components/ContextMenus/MudLogContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import formatDateString from "components/DateFormatter";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { measureToString } from "models/measure";
import MudLog from "models/mudLog";
import { ObjectType } from "models/objectType";
import { MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getObjectViewPath } from "routes/utils/pathBuilder";

export interface MudLogRow extends ContentTableRow {
  mudLog: MudLog;
  name: string;
  mudLogCompany: string;
  mudLogEngineers: string;
  startMd: string;
  endMd: string;
  dTimCreation: string;
  dTimLastChange: string;
  uid: string;
}

export default function MudLogsListView() {
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useOperationState();
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const { wellUid, wellboreUid } = useParams();
  const { objects: mudLogs } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.MudLog
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.MudLog);

  const onSelect = (mudLogRow: MudLogRow) => {
    navigate(
      getObjectViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        ObjectType.MudLog,
        mudLogRow.mudLog.uid
      )
    );
  };

  const getTableData = (): MudLogRow[] => {
    return mudLogs.map((mudLog) => {
      return {
        id: mudLog.uid,
        name: mudLog.name,
        mudLogCompany: mudLog.mudLogCompany,
        mudLogEngineers: mudLog.mudLogEngineers,
        startMd: measureToString(mudLog.startMd),
        endMd: measureToString(mudLog.endMd),
        dTimCreation: formatDateString(
          mudLog.commonData?.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          mudLog.commonData?.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        itemState: mudLog.commonData?.itemState,
        uid: mudLog.uid,
        mudLog
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    {
      property: "mudLogCompany",
      label: "mudLogCompany",
      type: ContentType.String
    },
    {
      property: "mudLogEngineers",
      label: "mudLogEngineers",
      type: ContentType.String
    },
    { property: "startMd", label: "startMd", type: ContentType.Measure },
    { property: "endMd", label: "endMd", type: ContentType.Measure },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    },
    {
      property: "itemState",
      label: "commonData.itemState",
      type: ContentType.String
    },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedRows: MudLogRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedRows.map((row) => row.mudLog)
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <MudLogContextMenu {...contextProps} />, position }
    });
  };

  return (
    mudLogs && (
      <ContentTable
        viewId="mudLogsListView"
        columns={columns}
        data={getTableData()}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName="MudLogs"
      />
    )
  );
}
