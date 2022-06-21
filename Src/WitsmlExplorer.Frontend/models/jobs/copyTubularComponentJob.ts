import { TubularComponentRow } from "../../components/ContentViews/TubularView";
import Tubular from "../tubular";
import TubularReference from "./tubularReference";

export interface CopyTubularComponentJob {
  sourceTubularComponentsReference: TubularComponentsReference;
  targetTubularReference: TubularReference;
}

export interface TubularComponentsReference {
  serverUrl: string;
  tubularReference: TubularReference;
  tubularComponentUids: string[];
}

export function parseStringToTubularComponentsReference(input: string): TubularComponentsReference {
  let jsonObject: TubularComponentsReference;
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

function verifyRequiredProperties(jsonObject: TubularComponentsReference) {
  const requiredProps = ["serverUrl", "tubularReference", "tubularComponentUids"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function createTubularComponentsReference(tubularComponents: TubularComponentRow[], source: Tubular, serverUrl: string): TubularComponentsReference {
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

export function createCopyTubularComponentJob(sourceTubularComponentsReference: TubularComponentsReference, target: Tubular): CopyTubularComponentJob {
  return {
    sourceTubularComponentsReference,
    targetTubularReference: {
      wellUid: target.wellUid,
      wellboreUid: target.wellboreUid,
      tubularUid: target.uid
    }
  };
}
