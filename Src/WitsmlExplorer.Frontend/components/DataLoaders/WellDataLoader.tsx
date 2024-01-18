import { useContext, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";

export function WellDataLoader() {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { wells } = navigationState;
  const { serverUrl, wellUid } = useParams();

  useEffect(() => {
    if (wells.length > 0) {
      const well = wells.find((well) => well.uid === wellUid);
      dispatchNavigation({
        type: NavigationType.SelectWell,
        payload: { well }
      });
    }
  }, [wells, serverUrl, wellUid]);

  return <Outlet />;
}
