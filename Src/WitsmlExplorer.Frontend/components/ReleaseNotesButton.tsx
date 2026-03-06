import { EdsProvider, Typography } from "@equinor/eds-core-react";
import ReleaseNotesModal from "components/Modals/ReleaseNotesModal";
import { Button } from "components/StyledComponents/Button";
import { UserTheme } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import styled from "styled-components";
import Icon from "styles/Icons";

const ReleaseNotesButton = () => {
  const { dispatchOperation } = useOperationState();

  const openReleaseNotes = () => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ReleaseNotesModal />
    });
  };

  return (
    <ReleaseNotesContainer>
      <Typography
        token={{
          fontFamily: "Equinor"
        }}
      >
        Release notes:
      </Typography>
      <EdsProvider density={UserTheme.Compact}>
        <Button
          variant="ghost_icon"
          aria-label="Open release notes"
          onClick={openReleaseNotes}
        >
          <Icon name="explore" size={18} />
        </Button>
      </EdsProvider>
    </ReleaseNotesContainer>
  );
};

const ReleaseNotesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 16px;
`;

export default ReleaseNotesButton;
