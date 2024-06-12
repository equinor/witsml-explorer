import ModalDialog, {
  ModalContentLayout,
  ModalWidth
} from "components/Modals/ModalDialog";
import { Checkbox } from "components/StyledComponents/Checkbox";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import ObjectOnWellbore from "models/objectOnWellbore";
import { Server } from "models/server";
import { ChangeEvent, useState } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export interface CompareLogDataModalProps {
  targetObject: ObjectOnWellbore;
  targetServer: Server;
  onPicked: (
    targetObject: ObjectOnWellbore,
    targetServer: Server,
    includeIndexDuplicates?: boolean,
    compareAllLogIndexes?: boolean
  ) => void;
}

export default function CompareLogDataModal({
  targetObject,
  targetServer,
  onPicked
}: CompareLogDataModalProps) {
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();
  const [checkedCompareAllLogIndexes, setCheckedCompareAllLogIndexes] =
    useState(false);
  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    onPicked(targetObject, targetServer, false, checkedCompareAllLogIndexes);
  };

  return (
    <ModalDialog
      heading={"Compare log data"}
      onSubmit={onSubmit}
      confirmColor={"primary"}
      confirmText={`Compare`}
      showCancelButton={true}
      width={ModalWidth.MEDIUM}
      isLoading={false}
      content={
        <ModalContentLayout>
          <StyledParagraph colors={colors}>
            By default, logs are compared within their shared log index
            interval. Do you want to compare all indexes instead?
          </StyledParagraph>
          <ButtonsContainer>
            <Checkbox
              colors={colors}
              label="Compare all log indexes"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setCheckedCompareAllLogIndexes(e.target.checked);
              }}
              checked={checkedCompareAllLogIndexes}
            />
          </ButtonsContainer>
        </ModalContentLayout>
      }
    />
  );
}

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding-left: 0.5rem;
  padding-bottom: 1rem;
`;

const StyledParagraph = styled.p<{
  colors: Colors;
}>`
  color: ${(props) => props.colors.text.staticIconsDefault};
`;
