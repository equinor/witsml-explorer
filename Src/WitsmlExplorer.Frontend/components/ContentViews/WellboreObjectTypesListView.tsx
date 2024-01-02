import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FilterContext, VisibilityStatus } from "../../contexts/filter";
import ModificationType from "../../contexts/modificationType";
import { SelectObjectGroupAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { ObjectType, pluralizeObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import ObjectService from "../../services/objectService";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

interface ObjectTypeRow extends ContentTableRow {
  uid: string;
  name: string;
  objectType: ObjectType;
}

export const WellboreObjectTypesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { wells, selectedWell, selectedWellbore } = navigationState;
  const { selectedFilter } = useContext(FilterContext);
  const { wellUid, wellboreUid } = useParams();

  useEffect(() => {
    const well: Well = wells.filter((well) => well.uid === wellUid)[0];
    const wellbore: Wellbore = well?.wellbores?.filter(
      (wellbore) => wellbore.uid === wellboreUid
    )[0];

    const updateWellborePartial = async () => {
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
    };

    if (well) {
      dispatchNavigation({
        type: NavigationType.SelectWell,
        payload: { well }
      });
      dispatchNavigation({
        type: NavigationType.SelectWellbore,
        payload: { well, wellbore }
      });
      if (wellbore.objectCount == null) {
        updateWellborePartial();
      }
    }
  }, [wells, wellUid, wellboreUid, selectedWell, selectedWellbore]);

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
