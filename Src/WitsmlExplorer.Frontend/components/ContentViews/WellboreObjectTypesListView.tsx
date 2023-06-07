import React, { useContext } from "react";
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

  const columns: ContentTableColumn[] = [{ property: "name", label: "Name", type: ContentType.String }];

  const getRows = (): ObjectTypeRow[] => {
    return Object.keys(ObjectType).map((key, index) => {
      return {
        id: index,
        uid: index,
        name: pluralizeObjectType(key as ObjectType),
        objectType: key as ObjectType
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

  return selectedWellbore ? <ContentTable columns={columns} data={getRows()} onSelect={onSelect} /> : <></>;
};

export default WellboreObjectTypesListView;
