import { Typography } from "@equinor/eds-core-react";
import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { useWellFilter } from "../../contexts/filter";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetWell } from "../../hooks/query/useGetWell";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WellboreContextMenu, {
  WellboreContextMenuProps
} from "../ContextMenus/WellboreContextMenu";
import formatDateString from "../DateFormatter";
import WellProgress from "../WellProgress";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface WellboreRow extends ContentTableRow, Wellbore {}

export default function WellboresListView() {
  const { authorizationState } = useAuthorizationState();
  const { wellUid } = useParams();
  const { well } = useGetWell(authorizationState?.server, wellUid);
  const [selectedWellFiltered] = useWellFilter(
    React.useMemo(() => (well ? [well] : []), [well]),
    React.useMemo(() => ({ filterWellbores: true }), [])
  );
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const navigate = useNavigate();

  useExpandSidebarNodes(wellUid);

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "wellType", label: "typeWellbore", type: ContentType.String },
    {
      property: "wellStatus",
      label: "statusWellbore",
      type: ContentType.String
    },
    { property: "uid", label: "uid", type: ContentType.String },
    {
      property: "dateTimeCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dateTimeLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    }
  ];

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    wellbore: Wellbore,
    checkedWellboreRows: WellboreRow[]
  ) => {
    const contextMenuProps: WellboreContextMenuProps = {
      wellbore,
      well: well,
      checkedWellboreRows
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <WellboreContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const getTableData = () => {
    return (
      selectedWellFiltered?.wellbores?.map((wellbore) => {
        return {
          ...wellbore,
          id: wellbore.uid,
          dateTimeCreation: formatDateString(
            wellbore.dateTimeCreation,
            timeZone,
            dateTimeFormat
          ),
          dateTimeLastChange: formatDateString(
            wellbore.dateTimeLastChange,
            timeZone,
            dateTimeFormat
          ),
          wellbore: wellbore
        };
      }) ?? []
    );
  };

  const onSelect = async (wellboreRow: any) => {
    navigate(
      `/servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        well.uid
      }/wellbores/${wellboreRow.wellbore.uid}/objectgroups`
    );
  };

  return (
    <WellProgress>
      {well && well.wellbores.length > 0 && !selectedWellFiltered?.wellbores ? (
        <Typography style={{ padding: "1rem" }}>
          No wellbores match the current filter
        </Typography>
      ) : (
        <ContentTable
          viewId="wellboresListView"
          columns={columns}
          data={getTableData()}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
          downloadToCsvFileName="Wellbores"
          checkableRows
          showRefresh
        />
      )}
    </WellProgress>
  );
}
