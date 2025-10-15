import { Divider } from "@equinor/eds-core-react";
import ModalDialog, { ModalWidth } from "components/Modals/ModalDialog";
import { useOperationState } from "hooks/useOperationState";
import ConfigurationChangeReason from "models/dataWorkOrder/configurationChangeReason";
import React from "react";
import styled from "styled-components";

export interface ConfigurationChangeReasonModalProps {
  changeReason: ConfigurationChangeReason;
}

export const ConfigurationChangeReasonModal = (
  props: ConfigurationChangeReasonModalProps
): React.ReactElement => {
  const { changeReason } = props;
  const {
    operationState: { colors }
  } = useOperationState();

  return (
    <ModalDialog
      width={ModalWidth.LARGE}
      heading="Configuration Change Reason"
      cancelText="Close"
      showConfirmButton={false}
      isLoading={false}
      onSubmit={() => {}}
      content={
        <HorizontalLayout>
          <div>TODO: Common Properties</div>
          <Divider
            style={{
              margin: "0px",
              backgroundColor: colors.interactive.disabledBorder
            }}
          />
          TODO: Change Properties. Comments: {changeReason.comments}
        </HorizontalLayout>
      }
    />
  );
};

const HorizontalLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
