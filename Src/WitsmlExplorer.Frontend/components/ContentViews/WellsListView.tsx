import { Typography } from "@equinor/eds-core-react";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { useWellFilter } from "../../contexts/filter";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useServers } from "../../contexts/serversContext";
import { useGetWells } from "../../hooks/query/useGetWells";
import Well from "../../models/well";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WellContextMenu, {
  WellContextMenuProps
} from "../ContextMenus/WellContextMenu";
import formatDateString from "../DateFormatter";
import ProgressSpinner from "../ProgressSpinner";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface WellRow extends ContentTableRow, Well {}

export default function WellsListView() {
  const { authorizationState } = useAuthorizationState();
  const { wells, isFetching } = useGetWells(authorizationState?.server, {
    placeholderData: []
  });
  const { servers } = useServers();
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const filteredWells = useWellFilter(wells);
  const navigate = useNavigate();

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "field", label: "field", type: ContentType.String },
    { property: "operator", label: "operator", type: ContentType.String },
    { property: "timeZone", label: "timeZone", type: ContentType.String },
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

  const onSelect = (well: any) => {
    navigate(
      `/servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        well.uid
      }/wellbores`
    );
  };

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    well: Well,
    checkedWellRows: WellRow[]
  ) => {
    const contextProps: WellContextMenuProps = {
      well,
      servers,
      dispatchOperation,
      checkedWellRows
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <WellContextMenu {...contextProps} />, position }
    });
  };

  const getTableData = () => {
    return filteredWells.map((well) => {
      return {
        ...well,
        id: well.uid,
        dateTimeCreation: formatDateString(
          well.dateTimeCreation,
          timeZone,
          dateTimeFormat
        ),
        dateTimeLastChange: formatDateString(
          well.dateTimeLastChange,
          timeZone,
          dateTimeFormat
        )
      };
    });
  };

  if (isFetching) {
    return (
      <ProgressSpinner message="Fetching wells. This may take some time." />
    );
  }

  return wells.length > 0 && filteredWells.length == 0 ? (
    <Typography style={{ padding: "1rem" }}>
      No wells match the current filter
    </Typography>
  ) : (
    <ContentTable
      viewId="wellsListView"
      columns={columns}
      data={getTableData()}
      onSelect={onSelect}
      onContextMenu={onContextMenu}
      checkableRows
      downloadToCsvFileName="Wells"
      showRefresh
    />
  );
}
