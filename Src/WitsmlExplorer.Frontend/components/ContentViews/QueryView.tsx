import { Button, Menu, TextField } from "@equinor/eds-core-react";
import React, { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import { DispatchOperation } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import QueryService from "../../services/queryService";
import { Colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import { templates } from "../../templates/templates";
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

export enum TemplateObjects {
  Attachment = "attachment",
  BhaRun = "bhaRun",
  CementJob = "cementJob",
  ChangeLog = "changeLog",
  ConvCore = "convCore",
  DrillReport = "drillReport",
  FluidsReport = "fluidsReport",
  FormationMarker = "formationMarker",
  Log = "log",
  Message = "message",
  MudLog = "mudLog",
  ObjectGroup = "objectGroup",
  OpsReport = "opsReport",
  Rig = "rig",
  Risk = "risk",
  SidewallCore = "sidewallCore",
  StimJob = "stimJob",
  SurveyProgram = "surveyProgram",
  Target = "target",
  ToolErrorModel = "toolErrorModel",
  ToolErrorTermSet = "toolErrorTermSet",
  Trajectory = "trajectory",
  Tubular = "tubular",
  WbGeometry = "wbGeometry",
  Well = "well",
  Wellbore = "wellbore"
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
  const [optionsIn, setOptionsIn] = useState<string>("");
  const [storeFunction, setStoreFunction] = useState(StoreFunction.GetFromStore);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);

  const sendQuery = () => {
    const getResult = async (dispatchOperation?: DispatchOperation | null) => {
      dispatchOperation?.({ type: OperationType.HideModal });
      setIsLoading(true);
      const requestReturnElements = storeFunction == StoreFunction.GetFromStore ? returnElements : undefined;
      let response = await QueryService.postQuery(query, storeFunction, requestReturnElements, optionsIn.trim());
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
          <StyledLargeTextField
            id="input"
            multiline
            colors={colors}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            defaultValue={query}
            textareaRef={inputRef}
          />
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem" }}>
            <StyledNativeSelect
              label="Function"
              id="function"
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setStoreFunction(event.target.value as StoreFunction)}
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
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setReturnElements(event.target.value as ReturnElements)}
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
            <StyledTextField
              id="optionsIn"
              label="Options In"
              value={optionsIn}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setOptionsIn(e.target.value);
              }}
              colors={colors}
            />
            <Button
              ref={setMenuAnchor}
              id="anchor-default"
              aria-haspopup="true"
              aria-expanded={isTemplateMenuOpen}
              aria-controls="menu-default"
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            >
              Template
              <Icon name="chevronUp" />
            </Button>
            <StyledMenu
              open={isTemplateMenuOpen}
              id="menu-default"
              aria-labelledby="anchor-default"
              onClose={() => setIsTemplateMenuOpen(false)}
              anchorEl={menuAnchor}
              colors={colors}
            >
              {Object.values(TemplateObjects).map((value) => {
                return (
                  <StyledMenuItem
                    colors={colors}
                    key={value}
                    onClick={() => {
                      const template = getTemplate(value as TemplateObjects, returnElements);
                      if (template != undefined) {
                        inputRef.current.value = template;
                        setQuery(template);
                      }
                      setIsTemplateMenuOpen(false);
                    }}
                  >
                    {value}
                  </StyledMenuItem>
                );
              })}
            </StyledMenu>
            <Button onClick={sendQuery} disabled={isLoading}>
              Execute
            </Button>
          </div>
        </div>
        <div>
          <StyledLargeTextField id="output" multiline colors={colors} readOnly value={result} textWrap={!isXmlResponse} />
        </div>
      </div>
    </>
  );
};

const getTemplate = (templateObject: TemplateObjects, returnElements: ReturnElements): string | undefined => {
  if (returnElements == ReturnElements.IdOnly) {
    if (templateObject == TemplateObjects.Well || templateObject == TemplateObjects.Wellbore || templateObject == TemplateObjects.ChangeLog) {
      return templates[templateObject + "IdOnly"];
    } else {
      return templates.objectIdOnly.replaceAll("object", templateObject);
    }
  } else if (
    returnElements == ReturnElements.DataOnly &&
    (templateObject == TemplateObjects.Log || templateObject == TemplateObjects.MudLog || templateObject == TemplateObjects.Trajectory)
  ) {
    return templates[templateObject + "DataOnly"];
  } else if (
    returnElements == ReturnElements.HeaderOnly &&
    (templateObject == TemplateObjects.Log || templateObject == TemplateObjects.MudLog || templateObject == TemplateObjects.Trajectory)
  ) {
    return templates[templateObject + "HeaderOnly"];
  } else if (returnElements == ReturnElements.StationLocationOnly && templateObject == TemplateObjects.Trajectory) {
    return templates[templateObject + "StationLocationOnly"];
  } else {
    return templates[templateObject];
  }
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

const StyledLargeTextField = styled(TextField)<{ colors: Colors; textWrap?: boolean }>`
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

const StyledMenu = styled(Menu)<{ colors: Colors }>`
  background: ${(props) => props.colors.ui.backgroundLight};
  padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  max-height: 80vh;
  overflow-y: scroll;
`;

const StyledMenuItem = styled(Menu.Item)<{ colors: Colors }>`
  &&:hover {
    background-color: ${(props) => props.colors.interactive.contextMenuItemHover};
  }
  color: ${(props) => props.colors.text.staticIconsDefault};
  padding: 4px;
`;

const StyledTextField = styled(TextField)<{ colors: Colors }>`
  label {
    color: ${(props) => props.colors.text.staticIconsDefault};
  }
  div {
    background: ${(props) => props.colors.text.staticTextFieldDefault};
  }
`;

export default QueryView;
