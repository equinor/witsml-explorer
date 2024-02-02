import { MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { useGetObjects } from "../../hooks/useGetObjects";
import { measureToString } from "../../models/measure";
import MudLog from "../../models/mudLog";
import { ObjectType } from "../../models/objectType";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import MudLogContextMenu from "../ContextMenus/MudLogContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import formatDateString from "../DateFormatter";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

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
  } = useContext(OperationContext);
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { wellUid, wellboreUid } = useParams();
  const { wellbore } = useGetWellbore(
    authorizationState?.server,
    wellUid,
    wellboreUid
  );

  const mudLogs = useGetObjects(
    wellUid,
    wellboreUid,
    ObjectType.MudLog
  ) as MudLog[];

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.MudLog);

  const onSelect = (mudLogRow: MudLogRow) => {
    navigate(
      `/servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${
        ObjectType.MudLog
      }/objects/${mudLogRow.mudLog.uid}`
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
      checkedObjects: checkedRows.map((row) => row.mudLog),
      wellbore
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
