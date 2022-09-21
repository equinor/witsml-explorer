import ObjectReferences from "../../../models/jobs/objectReferences";
import { ObjectType } from "../../../models/objectType";
import { parseStringToReferences } from "../UseClipboardReferences";

const SERVER_URL = "server";
const WELL_UID = "wellUid";
const WELLBORE_UID = "wellboreUid";
const OBJECT_UID_1 = "objectUid1";
const OBJECT_UID_2 = "objectUid2";
const OBJECT_UIDS_1 = [OBJECT_UID_1];
const OBJECT_TYPE = ObjectType.Log;

interface TextComponents {
  serverUrl?: string;
  wellUid?: string;
  wellboreUid?: string;
  objectUids?: string[];
  objectType?: ObjectType;
}

const getText = (textComponents?: TextComponents) => {
  const references: ObjectReferences = {
    serverUrl: textComponents?.serverUrl ?? SERVER_URL,
    wellUid: textComponents?.wellUid ?? WELL_UID,
    wellboreUid: textComponents?.wellboreUid ?? WELLBORE_UID,
    objectUids: textComponents?.objectUids ?? OBJECT_UIDS_1,
    objectType: textComponents?.objectType ?? OBJECT_TYPE
  };
  return JSON.stringify(references);
};

it("Should parse correct server url", async () => {
  const result = parseStringToReferences(getText({ serverUrl: SERVER_URL }));
  expect(result.serverUrl).toStrictEqual(SERVER_URL);
});

it("Should parse correct well uid", async () => {
  const result = parseStringToReferences(getText({ wellUid: WELL_UID }));
  expect(result.wellUid).toStrictEqual(WELL_UID);
});

it("Should parse correct wellbore uid", async () => {
  const result = parseStringToReferences(getText({ serverUrl: WELLBORE_UID }));
  expect(result.wellboreUid).toStrictEqual(WELLBORE_UID);
});

it("Should parse correct object uid", async () => {
  const result = parseStringToReferences(getText({ objectUids: [OBJECT_UID_1] }));
  expect(result.objectUids).toStrictEqual([OBJECT_UID_1]);
});

it("Should correctly parse multiple object uids", async () => {
  const result = parseStringToReferences(getText({ objectUids: [OBJECT_UID_1, OBJECT_UID_2] }));
  expect(result.objectUids).toStrictEqual([OBJECT_UID_1, OBJECT_UID_2]);
});

it("Should parse correct object type", async () => {
  const result = parseStringToReferences(getText({ serverUrl: ObjectType.Tubular }));
  expect(result.serverUrl).toStrictEqual(ObjectType.Tubular);
});

it("Should throw error on missing server", async () => {
  const references = {
    wellUid: WELL_UID,
    wellboreUid: WELLBORE_UID,
    objectUids: OBJECT_UIDS_1,
    objectType: OBJECT_TYPE
  };
  expect(() => parseStringToReferences(JSON.stringify(references))).toThrowError(new Error("Missing required fields."));
});

it("Should throw error on missing well uid", async () => {
  const references = {
    server: SERVER_URL,
    wellboreUid: WELLBORE_UID,
    objectUids: OBJECT_UIDS_1,
    objectType: OBJECT_TYPE
  };
  expect(() => parseStringToReferences(JSON.stringify(references))).toThrowError(new Error("Missing required fields."));
});

it("Should throw error on missing wellbore uid", async () => {
  const references = {
    wellUid: WELL_UID,
    server: SERVER_URL,
    objectUids: OBJECT_UIDS_1,
    objectType: OBJECT_TYPE
  };
  expect(() => parseStringToReferences(JSON.stringify(references))).toThrowError(new Error("Missing required fields."));
});

it("Should throw error on missing objects uids", async () => {
  const references = {
    wellUid: WELL_UID,
    wellboreUid: WELLBORE_UID,
    server: SERVER_URL,
    objectType: OBJECT_TYPE
  };
  expect(() => parseStringToReferences(JSON.stringify(references))).toThrowError(new Error("Missing required fields."));
});

it("Should throw error on missing object type", async () => {
  const references = {
    wellUid: WELL_UID,
    wellboreUid: WELLBORE_UID,
    objectUids: OBJECT_UIDS_1,
    server: SERVER_URL
  };
  expect(() => parseStringToReferences(JSON.stringify(references))).toThrowError(new Error("Missing required fields."));
});
