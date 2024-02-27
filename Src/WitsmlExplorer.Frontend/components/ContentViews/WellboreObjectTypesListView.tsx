import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConnectedServer } from "../../contexts/connectedServerContext";
import { FilterContext, VisibilityStatus } from "../../contexts/filter";
import { useGetCapObjects } from "../../hooks/query/useGetCapObjects";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import EntityType from "../../models/entityType";
import { ObjectType, pluralizeObjectType } from "../../models/objectType";
import { ItemNotFound } from "../../routes/ItemNotFound";
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
  const { selectedFilter } = useContext(FilterContext);
  const navigate = useNavigate();
  const { wellUid, wellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { wellbore, isFetching } = useGetWellbore(
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
      `${row.objectType}/${
        row.objectType === ObjectType.Log ? "logtypes" : "objects"
      }`
    );
  };

  if (!isFetching && !wellbore) {
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
