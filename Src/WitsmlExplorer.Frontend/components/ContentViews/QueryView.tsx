import { Button, TextField } from "@equinor/eds-core-react";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import QueryService from "../../services/queryService";
import { Colors } from "../../styles/Colors";
import { StyledNativeSelect } from "../Select";

export enum ReturnElements {
  All = "all",
  IdOnly = "idOnly",
  HeaderOnly = "headerOnly",
  DataOnly = "dataOnly",
  StationLocationOnly = "stationLocationOnly",
  LatestChangeOnly = "latestChangeOnly",
  Requested = "requested"
}

const QueryView = (): React.ReactElement => {
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [returnElements, setReturnElements] = useState(ReturnElements.All);

  const onChangeReturnElements = (event: any) => {
    setReturnElements(event.target.value);
  };

  const sendQuery = () => {
    const getResult = async () => {
      setIsLoading(true);
      let response = await QueryService.postQuery(query, returnElements);
      if (response.startsWith("<")) {
        response = formatXml(response);
      }
      setResult(response);
      setIsLoading(false);
    };
    getResult();
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", height: "100%", padding: "1rem" }}>
        <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: "1rem", height: "100%" }}>
          <StyledTextField id="input" multiline colors={colors} onChange={(e: any) => setQuery(e.target.value)} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem" }}>
            <StyledNativeSelect label="Return elements" id="return-elements" onChange={onChangeReturnElements} defaultValue={ReturnElements.All} colors={colors}>
              {Object.values(ReturnElements).map((value) => {
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </StyledNativeSelect>
            <Button onClick={sendQuery} disabled={isLoading}>
              Execute
            </Button>
          </div>
        </div>
        <div>
          <StyledTextField id="output" multiline colors={colors} readOnly value={result} />
        </div>
      </div>
    </>
  );
};

const formatXml = (xml: string) => {
  //https://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
  const xmlDoc = new DOMParser().parseFromString(xml, "application/xml");
  const xsltDoc = new DOMParser().parseFromString(
    [
      '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
      '  <xsl:strip-space elements="*"/>',
      '  <xsl:template match="para[content-style][not(text())]">',
      '    <xsl:value-of select="normalize-space(.)"/>',
      "  </xsl:template>",
      '  <xsl:template match="node()|@*">',
      '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
      "  </xsl:template>",
      '  <xsl:output indent="yes"/>',
      "</xsl:stylesheet>"
    ].join("\n"),
    "application/xml"
  );

  const xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsltDoc);
  const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  return new XMLSerializer().serializeToString(resultDoc);
};

const StyledTextField = styled(TextField)<{ colors: Colors }>`
  border: 1px solid ${(props) => props.colors.interactive.tableBorder};
  height: 100%;
  &&& > div {
    background-color: ${(props) => props.colors.ui.backgroundLight};
    height: 100% !important;
    border: 0;
    box-shadow: none;
  }
  div > textarea {
    height: 100%;
    overflow: scroll;
    text-wrap: nowrap;
    line-height: 15px;
    font-size: 13px;
    font-family: monospace;
    cursor: auto;
  }
  div > div {
    display: none; /* disable input adornment */
  }
`;

export default QueryView;
