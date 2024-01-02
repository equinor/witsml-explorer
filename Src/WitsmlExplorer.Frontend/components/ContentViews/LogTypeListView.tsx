import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, {
  calculateLogTypeDepthId,
  calculateLogTypeTimeId
} from "../../models/wellbore";
import ObjectService from "../../services/objectService";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

interface LogType {
  uid: number;
  name: string;
}

export const LogTypeListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { wells, selectedWell, selectedWellbore } = navigationState;
  const { wellUid, wellboreUid } = useParams();

  const onSelectObjectGroup = async (
    wellbore: Wellbore,
    objectType: ObjectType
  ) => {
    const objects = await ObjectService.getObjectsIfMissing(
      wellbore,
      objectType
    );
    dispatchNavigation({
      type: NavigationType.SelectObjectGroup,
      payload: {
        wellUid: wellUid,
        wellboreUid: wellboreUid,
        objectType,
        objects
      }
    });
  };

  useEffect(() => {
    const well: Well = wells.filter((well) => well.uid === wellUid)[0];
    const wellbore: Wellbore = well?.wellbores?.filter(
      (wellbore) => wellbore.uid === wellboreUid
    )[0];

    const updateWellborePartial = async () => {
      const objectCount = await ObjectService.getExpandableObjectsCount(
        wellbore
      );
      dispatchNavigation({
        type: ModificationType.UpdateWellborePartial,
        payload: {
          wellboreUid: wellbore.uid,
          wellUid: wellbore.wellUid,
          wellboreProperties: { objectCount }
        }
      });
    };
    if (well) {
      dispatchNavigation({
        type: NavigationType.SelectWell,
        payload: { well }
      });
      dispatchNavigation({
        type: NavigationType.SelectWellbore,
        payload: { well, wellbore }
      });
      if (wellbore?.objectCount == null) {
        updateWellborePartial();
      }
      onSelectObjectGroup(wellbore, ObjectType.Log);
    }
  }, [wells, wellUid, wellboreUid, selectedWell, selectedWellbore]);

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String }
  ];

  const logTypes: LogType[] = [
    { uid: 0, name: "Depth" },
    { uid: 1, name: "Time" }
  ];

  const onSelect = async (logType: any) => {
    const logTypeGroup =
      logType.uid === 0
        ? calculateLogTypeDepthId(selectedWellbore)
        : calculateLogTypeTimeId(selectedWellbore);

    dispatchNavigation({
      type: NavigationType.SelectLogType,
      payload: {
        well: selectedWell,
        wellbore: selectedWellbore,
        logTypeGroup: logTypeGroup
      }
    });
  };

  return (
    <ContentTable
      columns={columns}
      data={logTypes}
      onSelect={onSelect}
      showPanel={false}
    />
  );
};

export default LogTypeListView;
