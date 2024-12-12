import { EdsProvider, Table, TextField } from "@equinor/eds-core-react";

import { ExportableContentTableColumn } from "components/ContentViews/table/tableParts";

import { useOperationState } from "hooks/useOperationState";

import { ChangeEvent, useState } from "react";
import styled from "styled-components";
import { colors, Colors } from "styles/Colors";
import { CustomCurveRange } from "./CurveValuesPlot";
import { CurveSpecification } from "models/logData";

export const SettingCustomRanges = (props: {
  columns: ExportableContentTableColumn<CurveSpecification>[];
  data: any[];
}): React.ReactElement => {
  const {
    operationState: { colors }
  } = useOperationState();

  const minMaxValuesCalculation = props.columns
    .map((col) => col.columnOf.mnemonic)
    .map((curve) => {
      const curveData = props.data
        .map((obj) => obj[curve])
        .filter(Number.isFinite);
      return {
        curve: curve,
        minValue:
          curveData.length == 0
            ? null
            : curveData.reduce((min, v) => (min <= v ? min : v), Infinity),
        maxValue:
          curveData.length == 0
            ? null
            : curveData.reduce((max, v) => (max >= v ? max : v), -Infinity)
      };
    });
  const [ranges, setRanges] = useState<CustomCurveRange[]>(
    minMaxValuesCalculation
  );

  const onTextFieldChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    var server = ranges.find((x) => x.curve === index);
    server.minValue = Number(e.target.value);
    setRanges(ranges);
  };

  const onTextFieldChange2 = (
    e: ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    var server = ranges.find((x) => x.curve === index);
    server.maxValue = Number(e.target.value);
    setRanges(ranges);
  };

  return (
    <EdsProvider density="compact">
      <Container colors={colors}>
        <InnerContainer>
          <Table style={{ width: "100%" }} className="serversList">
            <Table.Head>
              <Table.Row>
                <Table.Cell style={CellHeaderStyle}>Curve</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {(ranges ?? [])
                .sort((a, b) => a.curve.localeCompare(b.curve))
                .map((server: CustomCurveRange) => (
                  <Table.Row id={server.curve} key={server.curve}>
                    <Table.Cell style={CellStyle}>{server.curve}</Table.Cell>
                    <Table.Cell style={CellStyle}>
                      <StartEndIndex>
                        <StyledTextField
                          id="startIndex"
                          defaultValue={server.minValue}
                          step="0.001"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            onTextFieldChange(e, server.curve);
                          }}
                        />

                        <StyledTextField
                          id="endIndex"
                          defaultValue={server.maxValue}
                          step="0.001"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            onTextFieldChange2(e, server.curve);
                          }}
                        />
                      </StartEndIndex>
                    </Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
        </InnerContainer>
      </Container>
    </EdsProvider>
  );
};

const StartEndIndex = styled.div`
  display: flex;
`;

const CellStyle = {
  color: colors.interactive.primaryResting,
  padding: "0.3rem",
  borderBottom: `2px solid ${colors.interactive.disabledBorder}`
};
const CellHeaderStyle = {
  ...CellStyle,
  background: colors.ui.backgroundLight
};

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

const StyledTextField = styled(TextField)`
  div {
    background-color: transparent;
  }
  min-width: 220px;
`;
