import { useContext, useEffect } from "react";
import { Outlet, useOutletContext, useParams } from "react-router-dom";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import Wellbore from "../../models/wellbore";
import ObjectService from "../../services/objectService";

type WellDataLoaderContextType = {
  wellbore: Wellbore;
};

export function useWellbore() {
  return useOutletContext<WellDataLoaderContextType>();
}

export function WellboreObjectTypesDataLoader() {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { wells } = navigationState;
  const { serverUrl, wellUid, wellboreUid } = useParams();

  useEffect(() => {
    if (wells && wells.length > 0) {
      const well = wells.find((well) => well.uid === wellUid);
      const wellbore = well.wellbores.find(
        (wellbore) => wellbore.uid === wellboreUid
      );
      if (wellbore) {
        const abortController = new AbortController();

        const fetchExpandableObjectsCount = async () => {
          const objectCount = await ObjectService.getExpandableObjectsCount(
            wellbore,
            abortController.signal
          );

          dispatchNavigation({
            type: NavigationType.SelectWellbore,
            payload: { well: well, wellbore }
          });
          dispatchNavigation({
            type: ModificationType.UpdateWellborePartial,
            payload: {
              wellboreUid: wellbore.uid,
              wellUid: well.uid,
              wellboreProperties: { objectCount }
            }
          });
        };
        if (wellbore?.objectCount == null) {
          fetchExpandableObjectsCount();
        }
        return () => {
          abortController.abort();
        };
      }
    }
  }, [wells, serverUrl, wellUid, wellboreUid]);

  return <Outlet />;
}
