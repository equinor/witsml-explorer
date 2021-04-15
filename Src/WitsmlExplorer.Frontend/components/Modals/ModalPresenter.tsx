import React from "react";
import OperationContext from "../../contexts/operationContext";

const ModalPresenter = (): React.ReactElement => {
  const { operationState } = React.useContext(OperationContext);
  const { modal } = operationState;

  return <>{modal}</>;
};

export default ModalPresenter;
