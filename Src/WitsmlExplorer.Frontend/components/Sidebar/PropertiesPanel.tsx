import React, { useState } from "react";
import styled from "styled-components";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { colors } from "../../styles/Colors";

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
          <ExpandMoreIcon color={"disabled"} style={{ width: 18 }} onClick={() => setExpanded(!expanded)} />
        ) : (
          <ChevronRightIcon color={"disabled"} style={{ width: 18 }} onClick={() => setExpanded(!expanded)} />
        )}
      </div>
      <PropertiesTable>
        <TableHead>
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
  font-size: 0.75rem;
  line-height: 1.25rem;
  font-family: EquinorMedium, sans-serif;
  color: ${colors.text.staticIconsDefault};
`;

const TableBody = styled.tbody`
  font-size: 0.625rem;
`;

const PropertyValue = styled.td`
  color: ${colors.text.staticIconsDefault};
  word-break: break-all;
`;

export default PropertiesPanel;
