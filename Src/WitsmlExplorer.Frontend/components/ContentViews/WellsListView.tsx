import { Typography } from "@equinor/eds-core-react";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import WellContextMenu, {
  WellContextMenuProps
} from "components/ContextMenus/WellContextMenu";
import formatDateString from "components/DateFormatter";
import ProgressSpinner from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWells } from "hooks/query/useGetWells";
import Well from "models/well";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { WELLBORES_PATH } from "routes/routerConstants";

export interface WellRow extends ContentTableRow, Well {}

export default function WellsListView() {
  const { connectedServer } = useConnectedServer();
  const { wells, isFetching } = useGetWells(connectedServer, {
    placeholderData: []
  });
  const { servers } = useGetServers();
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
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
    navigate(`${encodeURIComponent(well.uid)}/${WELLBORES_PATH}`);
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
    return wells.map((well) => {
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

  return wells?.length === 0 ? (
    <Typography style={{ padding: "1rem" }}>No wells found.</Typography>
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
