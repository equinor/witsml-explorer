import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { FilterContext, VisibilityStatus } from "../../contexts/filter";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { useGetWells } from "../../hooks/query/useGetWells";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { ObjectType, pluralizeObjectType } from "../../models/objectType";
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

export default function WellboreObjectTypesListView() {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, selectedWellbore } = navigationState;
  const { selectedFilter } = useContext(FilterContext);
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { serverUrl, wellUid, wellboreUid } = useParams();
  const { wells } = useGetWells(authorizationState?.server);

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  useExpandSidebarNodes(wellUid, wellboreUid);

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
    navigate(
      `/servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        selectedWell.uid
      }/wellbores/${selectedWellbore.uid}/objectgroups/${row.objectType}/${
        row.objectType === ObjectType.Log ? "logtypes" : "objects"
      }`
    );
  };

  return (
    selectedWellbore && (
      <ContentTable
        columns={columns}
        data={getRows()}
        onSelect={onSelect}
        showPanel={false}
      />
    )
  );
}
