import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { ObjectType } from "models/objectType";
import { useNavigate, useParams } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";

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
    navigate(
      `${logType.uid === 0 ? RouterLogType.DEPTH : RouterLogType.TIME}/objects`
    );
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
