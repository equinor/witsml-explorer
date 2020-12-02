import { parseStringToLogCurvesReference } from "../copyLogDataJob";

it("Should give error when provided invalid json string", () => {
  expect(() => parseStringToLogCurvesReference("Invalid")).toThrow(new Error("Invalid input given."));
});

it("Should give error when provided a valid json object, but with missing required properties", () => {
  expect(() => parseStringToLogCurvesReference(`{"uid": "1"}`)).toThrow(new Error("Missing required fields."));
});

it("Should not throw an error when valid input", () => {
  const objectString = `{
    "logReference": {
      "wellUid":"1",
      "wellboreUid":"2",
      "logUid":"3"
    },
    "mnemonics":["GS_BPOS"]
  }`;
  parseStringToLogCurvesReference(objectString);
});
