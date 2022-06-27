import { TubularComponentRow } from "../../components/ContentViews/TubularView";
import Tubular from "../tubular";
import TubularReference from "./tubularReference";

export interface CopyTubularComponentJob {
  sourceTubularComponentReferences: TubularComponentReferences;
  targetTubularReference: TubularReference;
}

export interface TubularComponentReferences {
  serverUrl: string;
  tubularReference: TubularReference;
  tubularComponentUids: string[];
}

export function parseStringToTubularComponentReferences(input: string): TubularComponentReferences {
  let jsonObject: TubularComponentReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);

  return {
    serverUrl: jsonObject.serverUrl,
    tubularReference: jsonObject.tubularReference,
    tubularComponentUids: jsonObject.tubularComponentUids
  };
}

function verifyRequiredProperties(jsonObject: TubularComponentReferences) {
  const requiredProps = ["serverUrl", "tubularReference", "tubularComponentUids"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function createTubularComponentReferences(tubularComponents: TubularComponentRow[], source: Tubular, serverUrl: string): TubularComponentReferences {
  return {
    serverUrl: serverUrl,
    tubularReference: {
      wellUid: source.wellUid,
      wellboreUid: source.wellboreUid,
      tubularUid: source.uid
    },
    tubularComponentUids: tubularComponents.map((component) => component.uid)
  };
}

export function createCopyTubularComponentJob(sourceTubularComponentReferences: TubularComponentReferences, target: Tubular): CopyTubularComponentJob {
  return {
    sourceTubularComponentReferences,
    targetTubularReference: {
      wellUid: target.wellUid,
      wellboreUid: target.wellboreUid,
      tubularUid: target.uid
    }
  };
}
