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

interface LogTypeRow {
  uid: number;
  name: string;
  logType: RouterLogType;
}

export default function LogTypeListView() {
  const navigate = useNavigate();
  const { wellUid, wellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  const logTypes: LogTypeRow[] = [
    { uid: 0, name: "All", logType: RouterLogType.ALL },
    { uid: 1, name: "Depth", logType: RouterLogType.DEPTH },
    { uid: 2, name: "Time", logType: RouterLogType.TIME }
  ];

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log);

  const onSelect = async (row: any) => {
    navigate(
      getLogObjectsViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        ObjectType.Log,
        row.logType
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
