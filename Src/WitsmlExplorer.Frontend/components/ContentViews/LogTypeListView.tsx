import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { ObjectType } from "../../models/objectType";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

interface LogType {
  uid: number;
  name: string;
}

export default function LogTypeListView() {
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
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
      `/servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${
        ObjectType.Log
      }/logtypes/${logType.uid === 0 ? "depth" : "time"}/objects`
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
