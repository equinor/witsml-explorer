import { Typography } from "@equinor/eds-core-react";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { BatchModifyMenuItem } from "components/ContextMenus/BatchModifyMenuItem";
import ContextMenu, {
  getContextMenuPosition
} from "components/ContextMenus/ContextMenu";
import { ObjectTypeToContextMenu } from "components/ContextMenus/ContextMenuMapping";
import LoadingContextMenu from "components/ContextMenus/LoadingContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import {
  FilterContext,
  filterTypeToProperty,
  getFilterTypeInformation,
  getSearchRegex,
  isObjectFilterType,
  isSitecomSyntax
} from "contexts/filter";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import { MousePosition } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import LogObject from "models/logObject";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import Well from "models/well";
import Wellbore, { calculateLogTypeId } from "models/wellbore";
import React, { useContext, useEffect, useState } from "react";
import ObjectService from "services/objectService";

export interface ObjectSearchRow extends ContentTableRow, ObjectOnWellbore {
  object: ObjectOnWellbore;
  well: Well;
  wellbore: Wellbore;
  objectType: ObjectType;
}

export const ObjectSearchListView = (): React.ReactElement => {
  const {
    navigationState: { wells },
    dispatchNavigation
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedFilter } = useContext(FilterContext);
  const [rows, setRows] = useState<ObjectSearchRow[]>([]);

  useEffect(() => {
    if (isObjectFilterType(selectedFilter.filterType)) {
      const regex = getSearchRegex(selectedFilter.name);
      setRows(
        selectedFilter.searchResults
          .filter(
            (searchResult) =>
              isSitecomSyntax(selectedFilter.name) ||
              regex.test(searchResult.searchProperty)
          ) // If we later want to filter away empty results, use regex.test(searchResult.searchProperty ?? ""))
          .map((searchResult) => {
            const well = wells?.find((w) => w.uid == searchResult.wellUid);
            const wellbore = well?.wellbores?.find(
              (wb) => wb.uid == searchResult.wellboreUid
            );
            return {
              id: searchResult.uid,
              ...searchResult,
              [filterTypeToProperty[selectedFilter.filterType]]:
                searchResult.searchProperty,
              object: searchResult,
              well,
              wellbore
            };
          })
      );
    }
  }, [selectedFilter]);

  const fetchSelectedObject = async (checkedObjectRow: ObjectSearchRow) => {
    return await ObjectService.getObject(
      checkedObjectRow.wellUid,
      checkedObjectRow.wellboreUid,
      checkedObjectRow.uid,
      checkedObjectRow.objectType
    );
  };

  const onContextMenuSingleObject = async (
    checkedObjectRow: ObjectSearchRow,
    position: MousePosition
  ) => {
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <LoadingContextMenu />, position }
    });
    const fetchedObject = await fetchSelectedObject(checkedObjectRow);
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: [fetchedObject],
      wellbore: checkedObjectRow.wellbore
    };
    const component = ObjectTypeToContextMenu[checkedObjectRow.objectType];
    if (component) {
      dispatchOperation({
        type: OperationType.DisplayContextMenu,
        payload: {
          component: React.createElement(component, { ...contextProps }),
          position
        }
      });
    }
  };

  const onContextMenuMultipleObjects = async (
    checkedObjectRows: ObjectSearchRow[],
    position: MousePosition
  ) => {
    const onlyOneObjectType = checkedObjectRows.every(
      (row) => row.objectType === rows[0].objectType
    );
    if (!onlyOneObjectType) {
      return;
    }
    const objectType = checkedObjectRows[0].objectType;

    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: (
          <ContextMenu
            menuItems={[
              <BatchModifyMenuItem
                key="batchModify"
                checkedObjects={checkedObjectRows}
                objectType={objectType}
              />
            ]}
          />
        ),
        position
      }
    });
  };

  const onContextMenu = async (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedObjectRows: ObjectSearchRow[]
  ) => {
    const position = getContextMenuPosition(event);
    // If only one object is selected, show the normal context menu for that object. Otherwise, show the batch menu.
    if (checkedObjectRows.length === 1) {
      await onContextMenuSingleObject(checkedObjectRows[0], position);
    } else {
      await onContextMenuMultipleObjects(checkedObjectRows, position);
    }
  };

  const getColumns = () => {
    const columns: ContentTableColumn[] = [
      { property: "objectType", label: "objectType", type: ContentType.String },
      { property: "name", label: "name", type: ContentType.String },
      {
        property: "wellboreName",
        label: "wellboreName",
        type: ContentType.String
      },
      { property: "wellName", label: "wellName", type: ContentType.String },
      { property: "uid", label: "uid", type: ContentType.String },
      {
        property: "wellboreUid",
        label: "wellboreUid",
        type: ContentType.String
      },
      { property: "wellUid", label: "wellUid", type: ContentType.String }
    ];

    if (filterTypeToProperty[selectedFilter?.filterType] != "name") {
      columns.unshift({
        property: filterTypeToProperty[selectedFilter?.filterType],
        label: filterTypeToProperty[selectedFilter?.filterType],
        type: ContentType.String
      });
    }

    return columns;
  };

  const onSelect = async (row: ObjectSearchRow) => {
    const objects = await ObjectService.getObjects(
      row.wellUid,
      row.wellboreUid,
      row.objectType
    );
    if (row.objectType == ObjectType.Log) {
      const logTypeGroup = calculateLogTypeId(
        row.wellbore,
        (objects.find((o) => o.uid == row.uid) as LogObject)?.indexType
      );
      row.wellbore.logs = objects;
      dispatchNavigation({
        type: NavigationType.SelectLogType,
        payload: {
          well: row.well,
          wellbore: row.wellbore,
          logTypeGroup: logTypeGroup
        }
      });
    } else {
      dispatchNavigation({
        type: NavigationType.SelectObjectGroup,
        payload: {
          objectType: row.objectType,
          wellUid: row.wellUid,
          wellboreUid: row.wellboreUid,
          objects
        }
      });
    }
  };

  return rows.length == 0 ? (
    <Typography style={{ padding: "1rem", whiteSpace: "pre-line" }}>
      {getFilterTypeInformation(selectedFilter.filterType)}
    </Typography>
  ) : (
    <ContentTable
      viewId="objectOnWellboreListView"
      checkableRows
      columns={getColumns()}
      onSelect={onSelect}
      data={rows}
      onContextMenu={onContextMenu}
      downloadToCsvFileName={`${selectedFilter.filterType}_search`}
    />
  );
};

export default ObjectSearchListView;
