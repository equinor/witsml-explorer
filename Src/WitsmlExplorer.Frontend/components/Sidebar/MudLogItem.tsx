import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import MudLog from "../../models/mudLog";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import TreeItem from "./TreeItem";

interface MudLogProps {
  nodeId: string;
  mudLog: MudLog;
  mudLogGroup: string;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
}

const MudLogItem = (props: MudLogProps): React.ReactElement => {
  const { mudLog, mudLogGroup, selected, well, wellbore, nodeId } = props;
  const { dispatchNavigation } = useContext(NavigationContext);

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={mudLog.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectMudLog, payload: { mudLog, wellbore, well, mudLogGroup } })}
    />
  );
};

export default MudLogItem;
