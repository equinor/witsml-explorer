import ProgressSpinner from "components/ProgressSpinner";
import NavigationContext from "contexts/navigationContext";
import React, { useContext } from "react";

type Props = {
  children: JSX.Element;
};

const WellProgress = ({ children }: Props): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { wells, selectedServer } = navigationState;
  const showIndicator = wells?.length == 0 && selectedServer != null;
  return showIndicator ? (
    <ProgressSpinner message="Fetching wells. This may take some time." />
  ) : (
    children
  );
};

export default WellProgress;
