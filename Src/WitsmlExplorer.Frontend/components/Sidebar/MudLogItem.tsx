import React, { useCallback, useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import GeologyInterval from "../../models/geologyInterval";
import MudLog from "../../models/mudLog";
import { calculateObjectNodeId } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, { getGeologyIntervalLength } from "../../models/wellbore";
import GeologyIntervalItem from "./GeologyIntervalItem";
import TreeItem from "./TreeItem";
import { WellboreItemContext } from "./WellboreItem";
import { ComponentType } from "../../models/componentType";
import ComponentService from "../../services/componentService";
import ModificationType from "../../contexts/modificationType";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ObjectOnWellboreItemProps {
  mudlogData: MudLog;
  objectType: ObjectType;
}

const MudLogItem = (props: ObjectOnWellboreItemProps): React.ReactElement => {
  const { mudlogData, objectType } = props;

  const { wellbore, well } = useContext(WellboreItemContext);
  const { dispatchNavigation, navigationState } = useContext(NavigationContext);
  const { selectedObject, selectedObjectGroup } = navigationState;

  const isSelected = useCallback(
    (mudlog: MudLog) => {
      return selectedObject &&
        selectedObjectGroup === ObjectType.MudLog &&
        selectedObject.mudloguid === mudlog.uid &&
        selectedObject.wellboreUid === mudlog.wellboreUid &&
        selectedObject.wellUid === mudlog.wellUid
        ? true
        : undefined;
    },
    [selectedObject, selectedObjectGroup]
  );

  return (
    <>
      <TreeItem
        nodeId={calculateObjectNodeId(mudlogData, ObjectType.MudLog)}
        labelText={mudlogData.name}
        onLabelClick={() => {
          dispatchNavigation({
            type: NavigationType.SelectObject,
            payload: {
              object: mudlogData,
              wellbore: wellbore,
              well: well,
              objectType
            }
          });
        }}
      >
        {listLogItemsByType(mudlogData, well, wellbore, isSelected)}
      </TreeItem>
    </>
  );
};

const listLogItemsByType = (
  mudlogs: MudLog,
  well: Well,
  wellbore: Wellbore,
  isSelected: (mudlogs: MudLog) => boolean
) => {
  const { dispatchNavigation } = useContext(NavigationContext);
  const [geologyIntervals, setGeologyIntervals] = useState<GeologyInterval[]>(
    []
  );

  const getGeologyInterval = () => {
    const abortController = new AbortController();
    const getGeologyIntervals = async () => {
      const geologyresult = await ComponentService.getComponents(
        mudlogs.wellUid,
        mudlogs.wellboreUid,
        mudlogs.uid,
        ComponentType.GeologyInterval,
        undefined,
        abortController.signal
      );
      setGeologyIntervals(geologyresult);
      const mudlogObjectIndex = wellbore.mudLogs.findIndex(
        (mudlogIndex) => mudlogIndex.uid === mudlogs.uid
      );

      if (mudlogObjectIndex > -1) {
        wellbore.mudLogs[mudlogObjectIndex].geologyInterval = geologyresult;
        dispatchNavigation({
          type: ModificationType.UpdateWellboreObjects,
          payload: {
            wellboreObjects: wellbore.mudLogs,
            wellUid: well.uid,
            wellboreUid: wellbore.uid,
            objectType: ObjectType.MudLog
          }
        });
      }
    };
    getGeologyIntervals();
  };

  useEffect(() => {
    if (mudlogs && mudlogs.uid) {
      const objects = getGeologyIntervalLength(wellbore, mudlogs.uid);
      if (objects == null) {
        getGeologyInterval();
      } else {
        setGeologyIntervals(objects);
      }
    }
  }, [wellbore]);

  return geologyIntervals.map((geology: GeologyInterval) =>
    geology.lithologies.length ? (
      <GeologyIntervalItem
        key={geology.uid}
        geology={geology}
        mudloguid={mudlogs.uid}
        well={well}
        wellbore={wellbore}
        selected={isSelected(mudlogs)}
        nodeId={geology.uid}
      />
    ) : (
      []
    )
  );
};

export default MudLogItem;
