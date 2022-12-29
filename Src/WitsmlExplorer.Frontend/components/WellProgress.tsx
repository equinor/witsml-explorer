import React, { useContext } from "react";
import NavigationContext from "../contexts/navigationContext";
import ProgressSpinner from "./ProgressSpinner";

type Props = {
  children: JSX.Element;
};

const WellProgress = ({ children }: Props): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { wells, selectedServer } = navigationState;
  //TODO show the progress only when the wells are actually being fetched
  const showIndicator = wells?.length == 0 && selectedServer != null;
  return showIndicator ? <ProgressSpinner message="Fetching wells. This may take some time." /> : children;
};

export default WellProgress;
