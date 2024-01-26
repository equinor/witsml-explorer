import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { useSidebar } from "../../contexts/sidebarContext";
import { SidebarActionType } from "../../contexts/sidebarReducer";
import { ObjectType } from "../../models/objectType";
import {
  calculateObjectGroupId,
  calculateWellNodeId,
  calculateWellboreNodeId
} from "../../models/wellbore";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

interface LogType {
  uid: number;
  name: string;
}

export default function LogTypeListView() {
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { dispatchSidebar } = useSidebar();
  const { wellUid, wellboreUid } = useParams();

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  const logTypes: LogType[] = [
    { uid: 0, name: "Depth" },
    { uid: 1, name: "Time" }
  ];

  useEffect(() => {
    dispatchSidebar({
      type: SidebarActionType.ExpandTreeNodes,
      payload: {
        nodeIds: [
          calculateWellNodeId(wellUid),
          calculateWellboreNodeId({ wellUid, uid: wellboreUid }),
          calculateObjectGroupId({ wellUid, uid: wellboreUid }, ObjectType.Log)
        ]
      }
    });
  }, [wellUid, wellboreUid]);

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
