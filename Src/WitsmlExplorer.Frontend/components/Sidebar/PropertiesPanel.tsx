import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";

interface PropertiesPanelProps {
  properties: Map<string, string>;
}

const PropertiesPanel = (props: PropertiesPanelProps): React.ReactElement => {
  const { properties } = props;
  const [expanded, setExpanded] = useState<boolean>(true);
  const keys = Array.from(properties.keys());

  return (
    <Container expanded={expanded}>
      <div>
        {expanded ? (
          <Icon name="chevronDown" color={"disabled"} style={{ width: 18 }} onClick={() => setExpanded(!expanded)} />
        ) : (
          <Icon name="chevronRight" color={"disabled"} style={{ width: 18 }} onClick={() => setExpanded(!expanded)} />
        )}
      </div>
      <PropertiesTable>
        <TableHead onClick={() => setExpanded(!expanded)}>
          <tr>
            <td colSpan={2}>Properties</td>
          </tr>
        </TableHead>
        {expanded && (
          <TableBody>
            {keys &&
              keys.map((key) => (
                <tr key={key}>
                  <td>{key}</td>
                  <PropertyValue>{properties.get(key)}</PropertyValue>
                </tr>
              ))}
          </TableBody>
        )}
      </PropertiesTable>
    </Container>
  );
};

const Container = styled.div<{ expanded: boolean }>`
  background-color: ${colors.ui.backgroundLight};
  display: flex;
  flex-direction: row;
  padding: 1rem 0.5rem;
  align-items: flex-start;
`;

const PropertiesTable = styled.table`
  margin-left: 0.5rem;
  width: 100%;
`;

const TableHead = styled.thead`
  font-size: 1rem;
  font-weight: bold;
  line-height: 1.25rem;
  font-family: EquinorMedium, sans-serif;
  color: ${colors.text.staticIconsDefault};
  :hover {
    background-color: ${colors.ui.backgroundDefault};
  }
`;

const TableBody = styled.tbody`
  font-size: 1rem;
`;

const PropertyValue = styled.td`
  color: ${colors.text.staticIconsDefault};
  word-break: break-all;
`;

export default PropertiesPanel;
