import { useEffect } from "react";
import { useSidebar } from "../contexts/sidebarContext";
import { SidebarActionType } from "../contexts/sidebarReducer";
import { ObjectType } from "../models/objectType";
import {
  calculateLogTypeId,
  calculateMultipleLogsNode,
  calculateObjectGroupId,
  calculateWellNodeId,
  calculateWellboreNodeId
} from "../models/wellbore";
import { RouterLogType } from "../routes/routerConstants";

export function useExpandSidebarNodes(
  wellUid: string,
  wellboreUid?: string,
  objectType?: ObjectType,
  logType?: RouterLogType,
  logName?: string
) {
  const { dispatchSidebar } = useSidebar();

  useEffect(() => {
    const nodeIds = [];
    if (wellUid) {
      nodeIds.push(calculateWellNodeId(wellUid));
    }

    if (wellUid && wellboreUid) {
      nodeIds.push(calculateWellboreNodeId({ wellUid, uid: wellboreUid }));
    }

    if (wellUid && wellboreUid && objectType) {
      nodeIds.push(
        calculateObjectGroupId({ wellUid, uid: wellboreUid }, objectType)
      );
    }

    if (wellUid && wellboreUid && logType) {
      nodeIds.push(calculateLogTypeId({ wellUid, uid: wellboreUid }, logType));
    }

    if (wellUid && wellboreUid && logType && logName) {
      nodeIds.push(
        calculateMultipleLogsNode(
          { wellUid, uid: wellboreUid },
          logType,
          logName
        )
      );
    }

    dispatchSidebar({
      type: SidebarActionType.ExpandTreeNodes,
      payload: { nodeIds }
    });
  }, [wellUid, wellboreUid, objectType, logType, logName]);
}
