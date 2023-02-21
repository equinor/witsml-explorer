import React, { useContext } from "react";
import { SelectObjectGroupAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { ObjectType, pluralizeObjectType } from "../../models/objectType";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const WellboreObjectTypesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore } = navigationState;

  const columns: ContentTableColumn[] = [{ property: "name", label: "Name", type: ContentType.String }];

  const getRows = () => {
    return Object.keys(ObjectType).map((key, index) => {
      return {
        uid: index,
        name: pluralizeObjectType(key as ObjectType),
        objectType: key as ObjectType
      };
    });
  };

  const onSelect = async (row: any) => {
    const action: SelectObjectGroupAction = { type: NavigationType.SelectObjectGroup, payload: { objectType: row.objectType, well: selectedWell, wellbore: selectedWellbore } };
    dispatchNavigation(action);
  };

  return selectedWellbore ? <ContentTable columns={columns} data={getRows()} onSelect={onSelect} /> : <></>;
};

export default WellboreObjectTypesListView;
