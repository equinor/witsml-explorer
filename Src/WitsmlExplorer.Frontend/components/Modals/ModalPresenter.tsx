import { Fragment, ReactElement, useContext } from "react";
import OperationContext from "contexts/operationContext";

const ModalPresenter = (): ReactElement => {
  const { operationState } = useContext(OperationContext);
  const { modals } = operationState;
  return (
    <>
      {modals.map((modal, index) => {
        return <Fragment key={index}>{modal}</Fragment>;
      })}
    </>
  );
};

export default ModalPresenter;
