import { useNavigate, useParams } from "react-router-dom";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { ObjectType } from "../../models/objectType";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

interface LogType {
  uid: number;
  name: string;
}

export default function LogTypeListView() {
  const navigate = useNavigate();
  const { wellUid, wellboreUid } = useParams();

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  const logTypes: LogType[] = [
    { uid: 0, name: "Depth" },
    { uid: 1, name: "Time" }
  ];

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log);

  const onSelect = async (logType: any) => {
    navigate(`${logType.uid === 0 ? "depth" : "time"}/objects`);
  };

  return (
    <ContentTable
      columns={columns}
      data={logTypes}
      onSelect={onSelect}
      showPanel={false}
    />
  );
}
