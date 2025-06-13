import { Button, Typography } from "@equinor/eds-core-react";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetObject } from "hooks/query/useGetObject";
import { useGetWell } from "hooks/query/useGetWell";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { useOperationState } from "hooks/useOperationState";
import { getObjectOnWellboreProperties } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { getWellProperties } from "models/well";
import { getWellboreProperties } from "models/wellbore";
import Icon from "styles/Icons";
import React from "react";
import { useParams } from "react-router-dom";

const PropertiesPanel = (): React.ReactElement => {
  const {
    operationState: { colors }
  } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const { wellUid, wellboreUid, objectGroup, objectUid } = useParams();
  const { well } = useGetWell(connectedServer, wellUid);
  const { wellbore } = useGetWellbore(connectedServer, wellUid, wellboreUid);
  const { object } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    objectGroup as ObjectType,
    objectUid
  );

  const getProperties = (): Map<string, string> => {
    if (object) {
      return getObjectOnWellboreProperties(object, objectGroup as ObjectType);
    } else if (wellbore) {
      return getWellboreProperties(wellbore);
    } else if (well) {
      return getWellProperties(well);
    }
    return new Map();
  };

  const properties = getProperties();

  const keys = Array.from(properties.keys());

  const copyToClipboard = async (key: string) => {
    await navigator.clipboard.writeText(key);
  };

  const copyAllPropertiesToClipboard = async () => {
    let tmpString = "";
    properties.forEach(function (value, key) {
      if (key.indexOf("UID") === 0) {
        tmpString += key.replace("UID", "") + " UID: " + value + ", ";
      } else {
        tmpString += key + " Name: " + value + ", ";
      }
    });
    const resultString =
      tmpString.length > 1
        ? tmpString.slice(0, tmpString.length - 2)
        : tmpString;
    await navigator.clipboard.writeText(resultString);
  };

  return (
    <>
      {" "}
      {keys.length > 0 && (
        <Button
          title="Copy all properties to clipboard"
          onClick={() => copyAllPropertiesToClipboard()}
          variant="ghost"
        >
          <Icon name="copy" />
          <Typography
            token={{
              color: colors.text.staticPropertyKey,
              fontSize: "0.75rem",
              fontFamily: "Equinor"
            }}
          >
            All
          </Typography>
        </Button>
      )}
      {keys.length ? (
        keys.map((key: string) => (
          <React.Fragment key={key}>
            <Typography
              token={{
                color: colors.text.staticPropertyKey,
                fontSize: "0.75rem",
                fontFamily: "Equinor"
              }}
              style={{
                paddingRight: "0.5rem",
                paddingLeft: "0.5rem",
                maxWidth: 100,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {" "}
              {key}:
            </Typography>
            <Typography
              token={{
                fontSize: "0.875rem",
                color: colors.text.staticPropertyValue,
                fontFamily: "EquinorMedium",
                fontWeight: 400
              }}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {properties.get(key)}
            </Typography>
            <Button
              variant="ghost_icon"
              key={"copy_button_" + key}
              aria-label="Copy value to clipboard"
              title="Copy value to clipboard"
              onClick={() => copyToClipboard(properties.get(key))}
            >
              <Icon name="copy" />
            </Button>
          </React.Fragment>
        ))
      ) : (
        <Typography
          token={{
            fontFamily: "Equinor",
            fontStyle: "italic",
            fontSize: "0.875rem",
            color: colors.infographic.primaryMossGreen
          }}
        >
          {" "}
          No Well Selected{" "}
        </Typography>
      )}
    </>
  );
};

export default PropertiesPanel;
