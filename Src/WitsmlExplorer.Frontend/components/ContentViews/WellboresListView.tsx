import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import WellboreContextMenu, {
  WellboreContextMenuProps
} from "components/ContextMenus/WellboreContextMenu";
import formatDateString from "components/DateFormatter";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWell } from "hooks/query/useGetWell";
import { useGetWellbores } from "hooks/query/useGetWellbores";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import EntityType from "models/entityType";
import Wellbore from "models/wellbore";
import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import { OBJECT_GROUPS_PATH } from "routes/routerConstants";

export interface WellboreRow extends ContentTableRow, Wellbore {}

export default function WellboresListView() {
  const { connectedServer } = useConnectedServer();
  const { wellUid } = useParams();
  const { servers } = useGetServers();
  const {
    well,
    isFetching: isFetchingWell,
    isFetched: isFetchedWell
  } = useGetWell(connectedServer, wellUid);
  const { wellbores, isFetching: isFetchingWellbores } = useGetWellbores(
    connectedServer,
    wellUid
  );
  const isFetching = isFetchingWell || isFetchingWellbores;
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
      servers,
      wellbore,
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
      wellbores?.map((wellbore) => {
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
      `${encodeURIComponent(wellboreRow.wellbore.uid)}/${OBJECT_GROUPS_PATH}`
    );
  };

  if (isFetchedWell && !well) {
    return <ItemNotFound itemType={EntityType.Well} />;
  }

  return (
    <>
      {isFetching && <ProgressSpinnerOverlay message="Fetching Wellbores." />}
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
    </>
  );
}
