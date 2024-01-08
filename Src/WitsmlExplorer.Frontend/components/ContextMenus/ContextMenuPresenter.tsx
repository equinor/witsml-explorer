import React, { useContext } from "react";
import OperationContext from "contexts/operationContext";

const ContextMenuPresenter = (): React.ReactElement => {
  const { operationState } = useContext(OperationContext);
  const { contextMenu } = operationState;

  return <>{contextMenu && contextMenu.component}</>;
};

export default ContextMenuPresenter;
