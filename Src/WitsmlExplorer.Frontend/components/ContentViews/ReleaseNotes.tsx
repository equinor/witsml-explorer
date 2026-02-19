import { Table, Typography } from "@equinor/eds-core-react";

import { useOperationState } from "hooks/useOperationState";
import React from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import jsonData from "./releaseNotes.json";

const ReleseNotes = (): React.ReactElement => {
  const {
    operationState: { colors }
  } = useOperationState();

  interface ReleaseNote {
    feature: string | undefined;
    description: string;
    releasedate: string;
  }

  const CellStyle = {
    color: colors.interactive.primaryResting,
    padding: "0.3rem",
    borderBottom: `2px solid ${colors.interactive.disabledBorder}`
  };
  const CellHeaderStyle = {
    ...CellStyle,
    background: colors.ui.backgroundLight
  };

  return (
    <>
      <Header>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <Typography
            style={{
              color: colors.infographic.primaryMossGreen,
              whiteSpace: "nowrap"
            }}
            bold={true}
          >
            Release Notes
          </Typography>
        </div>
      </Header>
      <Table style={{ width: "100%" }} className="releaseNoteList">
        <Table.Head>
          <Table.Row>
            <Table.Cell style={CellHeaderStyle}>Feature</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Description</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Release Date</Table.Cell>
          </Table.Row>
        </Table.Head>
        <StyledTableBody colors={colors}>
          {jsonData.map((releaseNote: ReleaseNote) => (
            <Table.Row id={releaseNote.feature} key={releaseNote.feature}>
              <Table.Cell style={CellStyle}>{releaseNote.feature}</Table.Cell>
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
    </>
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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.9rem;
  align-items: center;
`;

export default ReleseNotes;
