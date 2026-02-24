import { Table } from "@equinor/eds-core-react";

import { useOperationState } from "hooks/useOperationState";
import React from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import jsonData from "./releaseNotes.json";
import ModalDialog, { ModalContentLayout, ModalWidth } from "./ModalDialog";
import OperationType from "contexts/operationType";

export interface ReleaseNote {
  feature: string | undefined;
  description: string;
  releasedate: string;
}
const ReleaseNotesModal = (): React.ReactElement => {
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();

  const CellStyle = {
    color: colors.interactive.primaryResting,
    padding: "0.3rem",
    borderBottom: `2px solid ${colors.interactive.disabledBorder}`
  };
  const CellHeaderStyle = {
    ...CellStyle,
    background: colors.ui.backgroundLight
  };

  const CellHeaderStyleDate = {
    ...CellHeaderStyle,
    width: "100px"
  };

  return (
    <ModalDialog
      heading={"Release Notes"}
      onSubmit={() => dispatchOperation({ type: OperationType.HideModal })}
      isLoading={false}
      showCancelButton={false}
      confirmText="Ok"
      width={ModalWidth.LARGE}
      content={
        <ModalContentLayout>
          <Table style={{ width: "100%" }} className="releaseNoteList">
            <Table.Head>
              <Table.Row>
                <Table.Cell style={CellHeaderStyle}>Feature</Table.Cell>
                <Table.Cell style={CellHeaderStyle}>Description</Table.Cell>
                <Table.Cell style={CellHeaderStyleDate}>
                  Release Date
                </Table.Cell>
              </Table.Row>
            </Table.Head>
            <StyledTableBody colors={colors}>
              {jsonData.map((releaseNote: ReleaseNote) => (
                <Table.Row id={releaseNote.feature} key={releaseNote.feature}>
                  <Table.Cell style={CellStyle}>
                    {releaseNote.feature}
                  </Table.Cell>
                  <Table.Cell style={CellStyle}>
                    {releaseNote.description}
                  </Table.Cell>
                  <Table.Cell style={CellStyle}>
                    {releaseNote.releasedate}
                  </Table.Cell>
                </Table.Row>
              ))}
            </StyledTableBody>
          </Table>
        </ModalContentLayout>
      }
    />
  );
};

const StyledTableBody = styled(Table.Body)<{ colors: Colors }>`
  tr:nth-child(even) {
    background-color: ${(props) => props.colors.ui.backgroundLight};
  }

  tr:nth-child(odd) {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
`;

export default ReleaseNotesModal;
