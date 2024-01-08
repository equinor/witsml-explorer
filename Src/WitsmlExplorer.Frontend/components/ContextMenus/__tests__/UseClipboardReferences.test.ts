import { parseStringToReferences } from "components/ContextMenus/UseClipboardReferences";
import ObjectReferences from "models/jobs/objectReferences";
import { ObjectType } from "models/objectType";

const SERVER_URL = "server";
const WELL_UID = "wellUid";
const WELLBORE_UID = "wellboreUid";
const OBJECT_UID_1 = "objectUid1";
const OBJECT_UID_2 = "objectUid2";
const OBJECT_UIDS_1 = [OBJECT_UID_1];
const OBJECT_TYPE = ObjectType.Log;
const WELL_NAME = "wellName";
const WELLBORE_NAME = "wellboreName";
const OBJECT_NAMES = ["objectName"];

interface TextComponents {
  serverUrl?: string;
  wellUid?: string;
  wellboreUid?: string;
  objectUids?: string[];
  objectType?: ObjectType;
  wellName?: string;
  wellboreName?: string;
  names?: string[];
}

const getText = (textComponents: TextComponents) => {
  const references: ObjectReferences = {
    serverUrl: textComponents.serverUrl ?? SERVER_URL,
    wellUid: textComponents.wellUid ?? WELL_UID,
    wellboreUid: textComponents.wellboreUid ?? WELLBORE_UID,
    objectUids: textComponents.objectUids ?? OBJECT_UIDS_1,
    objectType: textComponents.objectType ?? OBJECT_TYPE,
    wellName: textComponents.wellName ?? WELL_NAME,
    wellboreName: textComponents.wellboreName ?? WELLBORE_NAME,
    names: textComponents.names ?? OBJECT_NAMES
  };
  return JSON.stringify(references);
};

const getInverseText = (textComponents: TextComponents) => {
  const references = {
    ...(textComponents.serverUrl ? {} : { serverUrl: SERVER_URL }),
    ...(textComponents.wellUid ? {} : { wellUid: WELL_UID }),
    ...(textComponents.wellboreUid ? {} : { wellboreUid: WELLBORE_UID }),
    ...(textComponents.objectUids ? {} : { objectUids: OBJECT_UIDS_1 }),
    ...(textComponents.objectType ? {} : { objectType: OBJECT_TYPE }),
    ...(textComponents.wellName ? {} : { wellName: WELL_NAME }),
    ...(textComponents.wellboreName ? {} : { wellboreName: WELLBORE_NAME }),
    ...(textComponents.names ? {} : { objectNames: OBJECT_NAMES })
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
  const result = parseStringToReferences(
    getText({ wellboreUid: WELLBORE_UID })
  );
  expect(result.wellboreUid).toStrictEqual(WELLBORE_UID);
});

it("Should parse correct object uid", async () => {
  const result = parseStringToReferences(
    getText({ objectUids: [OBJECT_UID_1] })
  );
  expect(result.objectUids).toStrictEqual([OBJECT_UID_1]);
});

it("Should correctly parse multiple object uids", async () => {
  const result = parseStringToReferences(
    getText({ objectUids: [OBJECT_UID_1, OBJECT_UID_2] })
  );
  expect(result.objectUids).toStrictEqual([OBJECT_UID_1, OBJECT_UID_2]);
});

it("Should parse correct object type", async () => {
  const result = parseStringToReferences(
    getText({ serverUrl: ObjectType.Tubular })
  );
  expect(result.serverUrl).toStrictEqual(ObjectType.Tubular);
});

it("Should parse correct well name", async () => {
  const result = parseStringToReferences(getText({ wellName: WELL_NAME }));
  expect(result.wellName).toStrictEqual(WELL_NAME);
});

it("Should parse correct wellbore name", async () => {
  const result = parseStringToReferences(
    getText({ wellboreName: WELLBORE_NAME })
  );
  expect(result.wellboreName).toStrictEqual(WELLBORE_NAME);
});

it("Should parse correct object name", async () => {
  const result = parseStringToReferences(getText({ objectUids: OBJECT_NAMES }));
  expect(result.names).toStrictEqual(OBJECT_NAMES);
});

it("Should throw error on missing server", async () => {
  const text = getInverseText({ serverUrl: "is missing" });
  expect(() => parseStringToReferences(text)).toThrowError(
    new Error("Missing required fields.")
  );
});

it("Should throw error on missing well uid", async () => {
  const text = getInverseText({ serverUrl: "is missing" });
  expect(() => parseStringToReferences(JSON.stringify(text))).toThrowError(
    new Error("Missing required fields.")
  );
});

it("Should throw error on missing wellbore uid", async () => {
  const text = getInverseText({ wellboreUid: "is missing" });
  expect(() => parseStringToReferences(JSON.stringify(text))).toThrowError(
    new Error("Missing required fields.")
  );
});

it("Should throw error on missing objects uids", async () => {
  const text = getInverseText({ objectUids: ["are missing"] });
  expect(() => parseStringToReferences(JSON.stringify(text))).toThrowError(
    new Error("Missing required fields.")
  );
});

it("Should throw error on missing object type", async () => {
  const text = getInverseText({ objectType: ObjectType.BhaRun });
  expect(() => parseStringToReferences(JSON.stringify(text))).toThrowError(
    new Error("Missing required fields.")
  );
});

it("Should throw error on missing well name", async () => {
  const text = getInverseText({ wellName: "is missing" });
  expect(() => parseStringToReferences(JSON.stringify(text))).toThrowError(
    new Error("Missing required fields.")
  );
});

it("Should throw error on missing wellbore name", async () => {
  const text = getInverseText({ wellboreName: "is missing" });
  expect(() => parseStringToReferences(JSON.stringify(text))).toThrowError(
    new Error("Missing required fields.")
  );
});

it("Should throw error on missing object names", async () => {
  const text = getInverseText({ names: ["are missing"] });
  expect(() => parseStringToReferences(JSON.stringify(text))).toThrowError(
    new Error("Missing required fields.")
  );
});
