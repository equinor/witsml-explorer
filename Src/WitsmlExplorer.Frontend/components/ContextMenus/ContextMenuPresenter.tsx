import { useOperationState } from "hooks/useOperationState";
import React from "react";

const ContextMenuPresenter = (): React.ReactElement => {
  const { operationState } = useOperationState();
  const { contextMenu } = operationState;

  return <>{contextMenu && contextMenu.component}</>;
};

export default ContextMenuPresenter;
