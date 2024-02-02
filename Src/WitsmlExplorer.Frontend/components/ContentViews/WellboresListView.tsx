import { Typography } from "@equinor/eds-core-react";
import React, { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { useWellFilter } from "../../contexts/filter";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useSidebar } from "../../contexts/sidebarContext";
import { SidebarActionType } from "../../contexts/sidebarReducer";
import { useGetWells } from "../../hooks/query/useGetWells";
import Wellbore, { calculateWellNodeId } from "../../models/wellbore";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WellboreContextMenu, {
  WellboreContextMenuProps
} from "../ContextMenus/WellboreContextMenu";
import formatDateString from "../DateFormatter";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface WellboreRow extends ContentTableRow, Wellbore {}

export default function WellboresListView() {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell } = navigationState;
  const { authorizationState } = useAuthorizationState();
  const { wells } = useGetWells(authorizationState?.server);
  const [selectedWellFiltered] = useWellFilter(
    React.useMemo(() => (selectedWell ? [selectedWell] : []), [selectedWell]),
    React.useMemo(() => ({ filterWellbores: true }), [])
  );
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const navigate = useNavigate();
  const { serverUrl, wellUid } = useParams();
  const { dispatchSidebar } = useSidebar();

  useEffect(() => {
    if (wells.length > 0) {
      const well = wells.find((well) => well.uid === wellUid);

      dispatchNavigation({
        type: NavigationType.SelectWell,
        payload: { well }
      });
    }
  }, [wells, serverUrl, wellUid]);

  useEffect(() => {
    dispatchSidebar({
      type: SidebarActionType.ExpandTreeNodes,
      payload: { nodeIds: [calculateWellNodeId(wellUid)] }
    });
  }, [wellUid]);

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
      well: selectedWell,
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
        selectedWell.uid
      }/wellbores/${wellboreRow.wellbore.uid}/objectgroups`
    );
  };

  return (
    selectedWell &&
    (selectedWell.wellbores.length > 0 && !selectedWellFiltered?.wellbores ? (
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
    ))
  );
}
