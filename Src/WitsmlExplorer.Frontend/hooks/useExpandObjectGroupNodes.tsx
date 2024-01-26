import { useEffect } from "react";
import { useSidebar } from "../contexts/sidebarContext";
import { SidebarActionType } from "../contexts/sidebarReducer";
import { ObjectType } from "../models/objectType";
import {
  calculateObjectGroupId,
  calculateWellNodeId,
  calculateWellboreNodeId
} from "../models/wellbore";

export function useExpandObjectsGroupNodes(
  wellUid: string,
  wellboreUid: string,
  objectType: ObjectType
) {
  const { dispatchSidebar } = useSidebar();

  useEffect(() => {
    dispatchSidebar({
      type: SidebarActionType.ExpandTreeNodes,
      payload: {
        nodeIds: [
          calculateWellNodeId(wellUid),
          calculateWellboreNodeId({ wellUid, uid: wellboreUid }),
          calculateObjectGroupId({ wellUid, uid: wellboreUid }, objectType)
        ]
      }
    });
  }, [wellUid, wellboreUid, objectType]);
}
