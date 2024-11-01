import { useOperationState } from "hooks/useOperationState";
import { Fragment, ReactElement } from "react";

const ModalPresenter = (): ReactElement => {
  const { operationState } = useOperationState();
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
