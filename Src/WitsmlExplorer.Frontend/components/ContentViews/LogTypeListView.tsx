import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { ObjectType } from "models/objectType";
import { useNavigate, useParams } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";
import { getLogObjectsViewPath } from "routes/utils/pathBuilder";

interface LogType {
  uid: number;
  name: string;
}

export default function LogTypeListView() {
  const navigate = useNavigate();
  const { wellUid, wellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  const logTypes: LogType[] = [
    { uid: 0, name: "Depth" },
    { uid: 1, name: "Time" }
  ];

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log);

  const onSelect = async (logType: any) => {
    const logTypePath =
      logType.uid === 0 ? RouterLogType.DEPTH : RouterLogType.TIME;
    navigate(
      getLogObjectsViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        ObjectType.Log,
        logTypePath
      )
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
