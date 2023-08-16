import React, { useContext } from "react";
import { FilterContext, VisibilityStatus } from "../../contexts/filter";
import { SelectObjectGroupAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { ObjectType, pluralizeObjectType } from "../../models/objectType";
import ObjectService from "../../services/objectService";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

interface ObjectTypeRow extends ContentTableRow {
  uid: number;
  name: string;
  objectType: ObjectType;
}

export const WellboreObjectTypesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore } = navigationState;
  const { selectedFilter } = React.useContext(FilterContext);

  const columns: ContentTableColumn[] = [{ property: "name", label: "Name", type: ContentType.String }];

  const getRows = (): ObjectTypeRow[] => {
    return Object.values(ObjectType)
      .filter((objectType) => selectedFilter.objectVisibilityStatus[objectType] == VisibilityStatus.Visible)
      .map((objectType, index) => {
        return {
          id: index,
          uid: index,
          name: pluralizeObjectType(objectType),
          objectType: objectType
        };
      });
  };

  const onSelect = async (row: ObjectTypeRow) => {
    const objects = await ObjectService.getObjectsIfMissing(selectedWellbore, row.objectType);
    const action: SelectObjectGroupAction = {
      type: NavigationType.SelectObjectGroup,
      payload: { objectType: row.objectType, wellUid: selectedWell.uid, wellboreUid: selectedWellbore.uid, objects }
    };
    dispatchNavigation(action);
  };

  return selectedWellbore ? <ContentTable columns={columns} data={getRows()} onSelect={onSelect} showPanel={false} /> : <></>;
};

export default WellboreObjectTypesListView;
