import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import { ObjectType } from "../../models/objectType";
import ContextMenu from "./ContextMenu";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";

const FluidsReportContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  return <ContextMenu menuItems={[...ObjectMenuItems(checkedObjects, ObjectType.FluidsReport, navigationState, dispatchOperation, wellbore)]} />;
};

export default FluidsReportContextMenu;
