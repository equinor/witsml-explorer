import { Button } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";

const JobsButton = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer } = navigationState;
  const { dispatchNavigation } = useContext(NavigationContext);

  const onClick = () => {
    dispatchNavigation({ type: NavigationType.SelectJobs, payload: {} });
  };

  return (
    <Button onClick={onClick} disabled={!selectedServer}>
      Jobs
    </Button>
  );
};

export default JobsButton;
