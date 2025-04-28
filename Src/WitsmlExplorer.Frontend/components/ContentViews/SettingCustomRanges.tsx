import {
  Button,
  CellProps,
  Divider,
  EdsProvider,
  Table,
  TextField
} from "@equinor/eds-core-react";
import { useOperationState } from "hooks/useOperationState";
import { ChangeEvent } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import { CurveRanges } from "./CurveValuesPlot";

export const SettingCustomRanges = (props: {
  rawDataRanges: CurveRanges;
  customRanges: CurveRanges;
  onChange: (curveRanges: CurveRanges) => void;
  onClose: () => void;
}): React.ReactElement => {
  const {
    operationState: { colors }
  } = useOperationState();

  const allRanges = { ...props.rawDataRanges, ...props.customRanges };

  const close = () => {
    props.onClose();
  };

  return (
    <EdsProvider density="compact">
      <Container colors={colors}>
        <InnerContainer>
          <CloseButton onClick={close}>
            Close custom ranges definition
          </CloseButton>
        </InnerContainer>
        <Divider />
        <InnerContainer>
          <Table style={{ width: "100%" }}>
            <Table.Head>
              <Table.Row>
                <StyledTableHeadCell colors={colors}>Curve</StyledTableHeadCell>
                <StyledTableHeadCell colors={colors}>
                  Min. value
                </StyledTableHeadCell>
                <StyledTableHeadCell colors={colors}>
                  Max. value
                </StyledTableHeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {Object.entries(allRanges).map(([curve, dataRange]) => (
                <Table.Row id={curve} key={curve}>
                  <StyledTableCell colors={colors}>{curve}</StyledTableCell>
                  <StyledTableCell colors={colors}>
                    <StyledTextField
                      id="startIndex"
                      defaultValue={dataRange.minValue}
                      type="number"
                      colors={colors}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newCustomRange = {
                          ...dataRange,
                          minValue: Number(e.target.value)
                        };
                        const newCustomRanges: CurveRanges = {
                          ...props.customRanges,
                          [curve]: newCustomRange
                        };
                        props.onChange(newCustomRanges);
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell colors={colors}>
                    <StyledTextField
                      id="endIndex"
                      defaultValue={dataRange.maxValue}
                      type="number"
                      colors={colors}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newCustomRange = {
                          ...dataRange,
                          maxValue: Number(e.target.value)
                        };
                        const newCustomRanges: CurveRanges = {
                          ...props.customRanges,
                          [curve]: newCustomRange
                        };
                        props.onChange(newCustomRanges);
                      }}
                    />
                  </StyledTableCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </InnerContainer>
      </Container>
    </EdsProvider>
  );
};

export const StyledTableCell = styled(Table.Cell)<{ colors: Colors }>`
  background-color: ${(props) =>
    props.colors.interactive.tableHeaderFillResting};
  color: ${(props) => props.colors.text.staticIconsDefault};
`;

const Container = styled.div<{ colors: Colors }>`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 0.5em;
  user-select: none;
  box-shadow: 1px 4px 5px 0px rgba(0, 0, 0, 0.3);
  background: ${(props) => props.colors.ui.backgroundLight};
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTextField = styled(TextField)<{ colors: Colors }>`
  label {
    color: red;
  }

  div {
    background-color: ${(props) => props.colors.ui.backgroundLight};
  }
`;

const CloseButton = styled(Button)`
  width: 300px;
`;

const StyledTableHeadCell = styled(Table.Cell)<{ colors: Colors } & CellProps>`
  background-color: ${(props) =>
    props.colors.interactive.tableHeaderFillResting};
  color: ${(props) => props.colors.text.staticIconsDefault};
`;
