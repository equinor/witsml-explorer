import {
  Button,
  CellProps,
  Divider,
  EdsProvider,
  Table,
  TextField
} from "@equinor/eds-core-react";
import { useOperationState } from "hooks/useOperationState";
import { ChangeEvent, useState } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import { CustomCurveRange } from "./CurveValuesPlot";

export const SettingCustomRanges = (props: {
  minMaxValuesCalculation: CustomCurveRange[];
  onChange: (curveRanges: CustomCurveRange[]) => void;
  onClose: () => void;
}): React.ReactElement => {
  const {
    operationState: { colors }
  } = useOperationState();

  const [ranges, setRanges] = useState<CustomCurveRange[]>(
    props.minMaxValuesCalculation
  );

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
              {(ranges ?? []).map((customRange: CustomCurveRange) => (
                <Table.Row id={customRange.curve} key={customRange.curve}>
                  <StyledTableCell colors={colors}>
                    {customRange.curve}
                  </StyledTableCell>
                  <StyledTableCell colors={colors}>
                    <StyledTextField
                      id="startIndex"
                      defaultValue={customRange.minValue}
                      type="number"
                      colors={colors}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        var server = ranges.find(
                          (x) => x.curve === customRange.curve
                        );
                        server.minValue = Number(e.target.value);
                        setRanges(ranges);
                        props.onChange(ranges);
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell colors={colors}>
                    <StyledTextField
                      id="endIndex"
                      defaultValue={customRange.maxValue}
                      type="number"
                      colors={colors}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        var server = ranges.find(
                          (x) => x.curve === customRange.curve
                        );
                        server.maxValue = Number(e.target.value);
                        setRanges(ranges);
                        props.onChange(ranges);
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
   {
    background-color: ${(props) =>
      props.colors.interactive.tableHeaderFillResting};
    color: ${(props) => props.colors.text.staticIconsDefault};
  }
`;
