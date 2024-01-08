import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { FilterContext, VisibilityStatus } from "contexts/filter";
import { SelectObjectGroupAction } from "contexts/navigationActions";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import { ObjectType, pluralizeObjectType } from "models/objectType";
import React, { useContext } from "react";
import ObjectService from "services/objectService";

interface ObjectTypeRow extends ContentTableRow {
  uid: string;
  name: string;
  objectType: ObjectType;
}

export const WellboreObjectTypesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore } = navigationState;
  const { selectedFilter } = useContext(FilterContext);

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  const getRows = (): ObjectTypeRow[] => {
    return Object.values(ObjectType)
      .filter(
        (objectType) =>
          selectedFilter.objectVisibilityStatus[objectType] ==
          VisibilityStatus.Visible
      )
      .map((objectType) => {
        return {
          id: objectType,
          uid: objectType,
          name: pluralizeObjectType(objectType),
          objectType: objectType
        };
      });
  };

  const onSelect = async (row: ObjectTypeRow) => {
    const objects = await ObjectService.getObjectsIfMissing(
      selectedWellbore,
      row.objectType
    );
    const action: SelectObjectGroupAction = {
      type: NavigationType.SelectObjectGroup,
      payload: {
        objectType: row.objectType,
        wellUid: selectedWell.uid,
        wellboreUid: selectedWellbore.uid,
        objects
      }
    };
    dispatchNavigation(action);
  };

  return selectedWellbore ? (
    <ContentTable
      columns={columns}
      data={getRows()}
      onSelect={onSelect}
      showPanel={false}
    />
  ) : (
    <></>
  );
};

export default WellboreObjectTypesListView;
