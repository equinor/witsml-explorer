import { useContext, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { SelectObjectGroupAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { ObjectType } from "../../models/objectType";
import ObjectService from "../../services/objectService";

function getObjectGroupType(objectGroup: string) {
  if (objectGroup === "bharuns") {
    return ObjectType.BhaRun;
  }
}

export function ObjectsDataLoader() {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { wells } = navigationState;
  const { serverUrl, wellUid, wellboreUid, objectGroup } = useParams();

  useEffect(() => {
    if (wells.length > 0) {
      const well = wells.find((well) => well.uid === wellUid);
      const wellbore = well.wellbores.find(
        (wellbore) => wellbore.uid === wellboreUid
      );
      const fetchObjectsIfMissing = async () => {
        const objects = await ObjectService.getObjectsIfMissing(
          wellbore,
          getObjectGroupType(objectGroup)
        );
        if (objects && objects.length > 0) {
          const action: SelectObjectGroupAction = {
            type: NavigationType.SelectObjectGroup,
            payload: {
              objectType: getObjectGroupType(objectGroup),
              wellUid: well.uid,
              wellboreUid: wellbore.uid,
              objects
            }
          };
          dispatchNavigation(action);
        }
      };

      fetchObjectsIfMissing();
    }
  }, [wells, serverUrl, wellUid, wellboreUid, objectGroup]);

  return <Outlet />;
}
