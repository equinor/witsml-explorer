import { Button, TextField } from "@equinor/eds-core-react";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import { DispatchOperation } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import QueryService from "../../services/queryService";
import { Colors } from "../../styles/Colors";
import ConfirmModal from "../Modals/ConfirmModal";
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

export enum StoreFunction {
  GetFromStore = "GetFromStore",
  AddToStore = "AddToStore",
  DeleteFromStore = "DeleteFromStore",
  UpdateInStore = "UpdateInStore"
}

const QueryView = (): React.ReactElement => {
  const {
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
  const [query, setQuery] = useState(retrieveStoredQuery());
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isXmlResponse, setIsXmlResponse] = useState(false);
  const [returnElements, setReturnElements] = useState(ReturnElements.All);
  const [storeFunction, setStoreFunction] = useState(StoreFunction.GetFromStore);

  const sendQuery = () => {
    const getResult = async (dispatchOperation?: DispatchOperation | null) => {
      dispatchOperation?.({ type: OperationType.HideModal });
      setIsLoading(true);
      const requestReturnElements = storeFunction == StoreFunction.GetFromStore ? returnElements : undefined;
      let response = await QueryService.postQuery(query, storeFunction, requestReturnElements);
      if (response.startsWith("<")) {
        response = formatXml(response);
      }
      setIsXmlResponse(response.startsWith("<"));
      setResult(response);
      setIsLoading(false);
    };
    if (storeFunction == StoreFunction.DeleteFromStore) {
      displayConfirmation(() => getResult(dispatchOperation), dispatchOperation);
    } else {
      getResult();
    }
  };

  useEffect(() => {
    const dispatch = setTimeout(() => {
      try {
        localStorage.setItem("queryViewInput", query);
      } catch {
        /* disregard unavailable local storage */
      }
    }, 200);
    return () => clearTimeout(dispatch);
  }, [query]);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", height: "100%", padding: "1rem" }}>
        <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: "1rem", height: "100%" }}>
          <StyledTextField id="input" multiline colors={colors} onChange={(e: any) => setQuery(e.target.value)} defaultValue={query} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem" }}>
            <StyledNativeSelect
              label="Function"
              id="function"
              onChange={(event: any) => setStoreFunction(event.target.value)}
              defaultValue={StoreFunction.GetFromStore}
              colors={colors}
            >
              {Object.values(StoreFunction).map((value) => {
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </StyledNativeSelect>
            <StyledNativeSelect
              label="Return elements"
              id="return-elements"
              onChange={(event: any) => setReturnElements(event.target.value)}
              defaultValue={ReturnElements.All}
              colors={colors}
            >
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
          <StyledTextField id="output" multiline colors={colors} readOnly value={result} textWrap={!isXmlResponse} />
        </div>
      </div>
    </>
  );
};

const displayConfirmation = (onConfirm: () => void, dispatchOperation: DispatchOperation) => {
  const confirmation = (
    <ConfirmModal
      heading={"Delete object?"}
      content={<span>Are you sure you want to delete this object?</span>}
      onConfirm={onConfirm}
      confirmColor={"danger"}
      confirmText={"Delete"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};

const retrieveStoredQuery = () => {
  try {
    return localStorage.getItem("queryViewInput") ?? "";
  } catch {
    return "";
  }
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

const StyledTextField = styled(TextField)<{ colors: Colors; textWrap?: boolean }>`
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
    text-wrap: ${(props) => (props.textWrap ? "wrap" : "nowrap")};
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
