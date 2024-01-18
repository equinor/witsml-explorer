import { useContext, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import {
  FilterContext,
  VisibilityStatus,
  allVisibleObjects
} from "../../contexts/filter";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import { ObjectType } from "../../models/objectType";
import CapService from "../../services/capService";
import WellService from "../../services/wellService";
import {
  STORAGE_FILTER_HIDDENOBJECTS_KEY,
  getLocalStorageItem
} from "../../tools/localStorageHelpers";

export function WellsDataLoader() {
  const { dispatchNavigation } = useContext(NavigationContext);
  const { updateSelectedFilter } = useContext(FilterContext);
  const { serverUrl } = useParams();

  const updateVisibleObjects = (supportedObjects: string[]) => {
    const updatedVisibility = { ...allVisibleObjects };
    const hiddenItems = getLocalStorageItem<ObjectType[]>(
      STORAGE_FILTER_HIDDENOBJECTS_KEY,
      { defaultValue: [] }
    );
    hiddenItems.forEach(
      (objectType) => (updatedVisibility[objectType] = VisibilityStatus.Hidden)
    );
    Object.values(ObjectType)
      .filter(
        (objectType) =>
          !supportedObjects
            .map((o) => o.toLowerCase())
            .includes(objectType.toLowerCase())
      )
      .forEach(
        (objectType) =>
          (updatedVisibility[objectType] = VisibilityStatus.Disabled)
      );
    updateSelectedFilter({ objectVisibilityStatus: updatedVisibility });
  };

  useEffect(() => {
    const fetchWells = async () => {
      const [wells, supportedObjects] = await Promise.all([
        WellService.getWells(),
        CapService.getCapObjects()
      ]);
      updateVisibleObjects(supportedObjects);
      dispatchNavigation({
        type: ModificationType.UpdateWells,
        payload: { wells: wells }
      });
    };
    fetchWells();
  }, [serverUrl]);

  return <Outlet />;
}
