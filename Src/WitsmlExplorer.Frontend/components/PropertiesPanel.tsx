import React from "react";
import { Typography } from "@equinor/eds-core-react";
import { colors } from "../styles/Colors";

interface PropertiesPanelProps {
  properties: Map<string, string>;
}

const PropertiesPanel = (props: PropertiesPanelProps): React.ReactElement => {
  const { properties } = props;
  const keys = Array.from(properties.keys());

  return (
    <>
      {
        keys.length ? keys.map((key: string,index:number) => (
          <React.Fragment key={index}>
            <Typography key={key} token={{ color: colors.text.staticIconsTertiary, fontSize: '0.75rem', fontFamily: 'Equinor' }}
              style={{ paddingRight: "0.5rem", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}> {key}:
            </Typography>
            <Typography key={properties.get(key)} token={{ fontSize: "0.875rem", color: colors.interactive.primaryResting, fontFamily: "EquinorMedium", fontWeight: 400 }}
              style={{ paddingRight: '1.5rem',overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {properties.get(key)}
            </Typography>
          </React.Fragment>
      )) : <Typography key={"noWellSelected"} token={{ fontFamily: "Equinor", fontStyle: "italic", fontSize: "0.875rem", color: colors.text.staticIconsTertiary }}>  No Well Selected </Typography>
    }
    </>
  );
};

export default PropertiesPanel;