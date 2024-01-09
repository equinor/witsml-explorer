import { Typography } from "@equinor/eds-core-react";
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
import { useWellFilter } from "contexts/filter";
import ModificationType from "contexts/modificationType";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import Wellbore from "models/wellbore";
import React, { useContext } from "react";
import ObjectService from "services/objectService";

export interface WellboreRow extends ContentTableRow, Wellbore {}

export const WellboresListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell } = navigationState;
  const [selectedWellFiltered] = useWellFilter(
    React.useMemo(() => (selectedWell ? [selectedWell] : []), [selectedWell]),
    React.useMemo(() => ({ filterWellbores: true }), [])
  );
  const {
    dispatchOperation,
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);

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
    const wellbore: Wellbore = wellboreRow.wellbore;
    dispatchNavigation({
      type: NavigationType.SelectWellbore,
      payload: { well: selectedWell, wellbore }
    });
    if (wellbore.objectCount == null) {
      const objectCount = await ObjectService.getExpandableObjectsCount(
        wellbore
      );
      dispatchNavigation({
        type: ModificationType.UpdateWellborePartial,
        payload: {
          wellboreUid: wellbore.uid,
          wellUid: wellbore.wellUid,
          wellboreProperties: { objectCount }
        }
      });
    }
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
};

export default WellboresListView;
