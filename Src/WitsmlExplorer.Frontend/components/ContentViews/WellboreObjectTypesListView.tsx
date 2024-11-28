import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { useConnectedServer } from "contexts/connectedServerContext";
import { FilterContext, VisibilityStatus } from "contexts/filter";
import { useGetCapObjects } from "hooks/query/useGetCapObjects";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import EntityType from "models/entityType";
import { ObjectType, pluralizeObjectType } from "models/objectType";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import {
  getLogTypesViewPath,
  getObjectsViewPath
} from "routes/utils/pathBuilder";

interface ObjectTypeRow extends ContentTableRow {
  uid: string;
  name: string;
  objectType: ObjectType;
}

export default function WellboreObjectTypesListView() {
  const { selectedFilter } = useContext(FilterContext);
  const navigate = useNavigate();
  const { wellUid, wellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { wellbore, isFetched } = useGetWellbore(
    connectedServer,
    wellUid,
    wellboreUid
  );
  const { capObjects } = useGetCapObjects(connectedServer, {
    placeholderData: Object.entries(ObjectType)
  });

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  useExpandSidebarNodes(wellUid, wellboreUid);

  const getRows = (): ObjectTypeRow[] => {
    return Object.values(ObjectType)
      .filter(
        (objectType) =>
          selectedFilter.objectVisibilityStatus[objectType] ==
            VisibilityStatus.Visible && capObjects.includes(objectType)
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
      row.objectType == ObjectType.Log
        ? getLogTypesViewPath(
            connectedServer?.url,
            wellbore.wellUid,
            wellbore.uid,
            ObjectType.Log
          )
        : getObjectsViewPath(
            connectedServer?.url,
            wellbore.wellUid,
            wellbore.uid,
            row.objectType
          )
    );
  };

  if (isFetched && !wellbore) {
    return <ItemNotFound itemType={EntityType.Wellbore} />;
  }

  return (
    <ContentTable
      columns={columns}
      data={getRows()}
      onSelect={onSelect}
      showPanel={false}
    />
  );
}
