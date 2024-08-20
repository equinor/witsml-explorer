import { ObjectType } from "models/objectType";
import { templates } from "templates/templates";

export enum ReturnElements {
  All = "all",
  IdOnly = "idOnly",
  HeaderOnly = "headerOnly",
  DataOnly = "dataOnly",
  StationLocationOnly = "stationLocationOnly",
  LatestChangeOnly = "latestChangeOnly",
  Requested = "requested",
  None = ""
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

export const ObjectTypeToTemplateObject: Record<ObjectType, TemplateObjects> = {
  [ObjectType.BhaRun]: TemplateObjects.BhaRun,
  [ObjectType.ChangeLog]: TemplateObjects.ChangeLog,
  [ObjectType.FluidsReport]: TemplateObjects.FluidsReport,
  [ObjectType.FormationMarker]: TemplateObjects.FormationMarker,
  [ObjectType.Log]: TemplateObjects.Log,
  [ObjectType.Message]: TemplateObjects.Message,
  [ObjectType.MudLog]: TemplateObjects.MudLog,
  [ObjectType.Rig]: TemplateObjects.Rig,
  [ObjectType.Risk]: TemplateObjects.Risk,
  [ObjectType.Trajectory]: TemplateObjects.Trajectory,
  [ObjectType.Tubular]: TemplateObjects.Tubular,
  [ObjectType.WbGeometry]: TemplateObjects.WbGeometry
};

export interface QueryTemplatePreset {
  templateObject: TemplateObjects;
  wellUid?: string;
  wellboreUid?: string;
  objectUid?: string;
  storeFunction?: StoreFunction;
  returnElements?: ReturnElements;
  optionsIn?: string;
}

export const getQueryTemplateWithPreset = (
  templatePreset: QueryTemplatePreset
): string | undefined => {
  if (!templatePreset) return null;
  const { wellUid, wellboreUid, objectUid, templateObject, returnElements } =
    templatePreset;
  let template = getQueryTemplate(templateObject, returnElements);
  if (!template) return null;
  if (objectUid) {
    template = template.replace(
      /uidWell="" uidWellbore="" uid=""/g,
      `uidWell="${wellUid ?? ""}" uidWellbore="${
        wellboreUid ?? ""
      }" uid="${objectUid}"`
    );
  } else if (wellboreUid) {
    template = template.replace(
      /uidWell="" uid=""/g,
      `uidWell="${wellUid ?? ""}" uid="${wellboreUid}"`
    );
  } else if (wellUid) {
    template = template.replace(/<well uid="">/g, `<well uid="${wellUid}">`);
  }
  return template;
};

export const getQueryTemplate = (
  templateObject: TemplateObjects,
  returnElements: ReturnElements
): string | undefined => {
  if (returnElements === ReturnElements.IdOnly) {
    if (
      templateObject === TemplateObjects.Well ||
      templateObject === TemplateObjects.Wellbore ||
      templateObject === TemplateObjects.ChangeLog
    ) {
      return templates[templateObject + "IdOnly"];
    } else {
      return templates.objectIdOnly.replaceAll("object", templateObject);
    }
  } else if (
    returnElements === ReturnElements.DataOnly &&
    (templateObject === TemplateObjects.Log ||
      templateObject === TemplateObjects.MudLog ||
      templateObject === TemplateObjects.Trajectory)
  ) {
    return templates[templateObject + "DataOnly"];
  } else if (
    returnElements === ReturnElements.HeaderOnly &&
    (templateObject === TemplateObjects.Log ||
      templateObject === TemplateObjects.MudLog ||
      templateObject === TemplateObjects.Trajectory)
  ) {
    return templates[templateObject + "HeaderOnly"];
  } else if (
    returnElements === ReturnElements.StationLocationOnly &&
    templateObject === TemplateObjects.Trajectory
  ) {
    return templates[templateObject + "StationLocationOnly"];
  } else {
    return templates[templateObject];
  }
};

export const formatXml = (xml: string) => {
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

export const getParserError = (formattedQuery: string) => {
  const parserErrorMatch = formattedQuery.match(
    /<parsererror.*?>[\s\S]*?<\/parsererror>/i
  );
  if (parserErrorMatch) {
    const errorMatch = parserErrorMatch[0]?.match(/<div.*?>([\s\S]*?)<\/div>/i);
    if (errorMatch) {
      return errorMatch[1];
    }
  }
  return null;
};
