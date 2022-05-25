import React, { useContext } from "react";
import TreeItem from "./TreeItem";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import Tubular from "../../models/tubular";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";

interface TubularProps {
  nodeId: string;
  tubular: Tubular;
  tubularGroup: string;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
}

const TubularItem = (props: TubularProps): React.ReactElement => {
  const { tubular, tubularGroup, selected, well, wellbore, nodeId } = props;
  const { dispatchNavigation } = useContext(NavigationContext);

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={tubular.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectTubular, payload: { tubular, wellbore, well, tubularGroup } })}
    />
  );
};

export default TubularItem;
