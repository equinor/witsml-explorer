import React, { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { FilterContext, VisibilityStatus } from "../../contexts/filter";
import ModificationType from "../../contexts/modificationType";
import { SelectObjectGroupAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { useSidebar } from "../../contexts/sidebarContext";
import { SidebarActionType } from "../../contexts/sidebarReducer";
import { ObjectType, pluralizeObjectType } from "../../models/objectType";
import {
  calculateWellNodeId,
  calculateWellboreNodeId
} from "../../models/wellbore";
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
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { serverUrl, wellUid, wellboreUid } = useParams();
  const { dispatchSidebar } = useSidebar();

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  useEffect(() => {
    dispatchSidebar({
      type: SidebarActionType.ExpandTreeNodes,
      payload: {
        nodeIds: [
          calculateWellNodeId(wellUid),
          calculateWellboreNodeId({ wellUid: wellUid, uid: wellboreUid })
        ]
      }
    });
  }, [wellUid]);

  useEffect(() => {
    if (wells.length > 0) {
      const well = wells.find((well) => well.uid === wellUid);
      const wellbore = well.wellbores.find(
        (wellbore) => wellbore.uid === wellboreUid
      );

      dispatchNavigation({
        type: NavigationType.SelectWell,
        payload: { well }
      });

      dispatchNavigation({
        type: NavigationType.SelectWellbore,
        payload: { well: well, wellbore }
      });

      const fetchExpandableObjectsCount = async () => {
        const objectCount = await ObjectService.getExpandableObjectsCount(
          wellbore
        );
        dispatchNavigation({
          type: ModificationType.UpdateWellborePartial,
          payload: {
            wellboreUid: wellbore.uid,
            wellUid: well.uid,
            wellboreProperties: { objectCount }
          }
        });
      };
      if (wellbore?.objectCount == null) {
        fetchExpandableObjectsCount();
      }
    }
  }, [wells, serverUrl, wellUid, wellboreUid]);

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
    const pluralizedObjectType = pluralizeObjectType(row.objectType);
    const objectTypeUrlFormat = pluralizedObjectType
      .replace(/ /g, "")
      .toLowerCase();
    navigate(
      `/servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        selectedWell.uid
      }/wellbores/${selectedWellbore.uid}/objectgroups/${objectTypeUrlFormat}/${
        objectTypeUrlFormat === "logs" ? "logtypes" : "objects"
      }`
    );
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
