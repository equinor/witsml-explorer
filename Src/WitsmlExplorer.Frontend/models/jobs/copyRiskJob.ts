import RiskReferences from "./riskReferences";
import WellboreReference from "./wellboreReference";

export default interface CopyRiskJob {
  source: RiskReferences;
  target: WellboreReference;
}

function verifyRequiredProperties(jsonObject: RiskReferences) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "riskUids"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}

export function parseStringToRiskReferences(input: string): RiskReferences {
  let jsonObject: RiskReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}
