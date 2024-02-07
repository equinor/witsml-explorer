import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FilterContext, VisibilityStatus } from "../../contexts/filter";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { ObjectType, pluralizeObjectType } from "../../models/objectType";
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
  const { serverUrl, wellUid, wellboreUid } = useParams();

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  useExpandSidebarNodes(wellUid, wellboreUid);

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
      `/servers/${encodeURIComponent(serverUrl)}
      /wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${row.objectType}
      /${row.objectType === ObjectType.Log ? "logtypes" : "objects"}`
    );
  };

  return (
    <ContentTable
      columns={columns}
      data={getRows()}
      onSelect={onSelect}
      showPanel={false}
    />
  );
}
