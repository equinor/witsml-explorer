import { getMeasureWithDatum } from "__testUtils__/testUtils";
import BhaRun from "models/bhaRun";
import ChangeLog from "models/changeLog";
import FormationMarker from "models/formationMarker";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Trajectory from "models/trajectory";
import Well from "models/well";
import Wellbore, {
  WellboreObjects,
  objectTypeToWellboreObjects
} from "models/wellbore";

export const SERVER_1: Server = {
  id: "1",
  name: "WITSML server",
  url: "http://example.com",
  description: "Witsml server",
  roles: [],
  credentialIds: [],
  depthLogDecimals: 0
};
export const SERVER_2: Server = {
  id: "2",
  name: "WITSML server 2",
  url: "http://example2.com",
  description: "Witsml server 2",
  roles: [],
  credentialIds: [],
  depthLogDecimals: 0
};
export const getEmptyWellboreObjects = () => {
  const labels = Object.values(ObjectType).map((label) =>
    objectTypeToWellboreObjects(label)
  );
  const wellboreObjects: WellboreObjects = {};
  labels.forEach((label) => (wellboreObjects[label] = []));
  return wellboreObjects;
};
export const WELLBORE_1: Wellbore = {
  uid: "wellbore1",
  wellUid: "well1",
  name: "Wellbore 1",
  wellStatus: "",
  wellType: "",
  isActive: false,
  ...getEmptyWellboreObjects()
};
export const WELLBORE_2: Wellbore = {
  uid: "wellbore2",
  wellUid: "well2",
  name: "Wellbore 2",
  ...getEmptyWellboreObjects(),
  wellStatus: "",
  wellType: "",
  isActive: false
};
export const WELLBORE_3: Wellbore = {
  uid: "wellbore3",
  wellUid: "well3",
  name: "Wellbore 3",
  ...getEmptyWellboreObjects(),
  wellStatus: "",
  wellType: "",
  isActive: false
};
export const WELL_1: Well = {
  uid: "well1",
  name: "Well 1",
  field: "",
  operator: "",
  country: ""
};
export const WELL_2: Well = {
  uid: "well2",
  name: "Well 2",
  field: "",
  operator: "",
  country: ""
};
export const WELL_3: Well = {
  uid: "well3",
  name: "Well 3",
  field: "",
  operator: "",
  country: ""
};
export const WELLS = [WELL_1, WELL_2, WELL_3];
export const BHARUN_1: BhaRun = {
  uid: "bharun",
  name: "bharun 1",
  wellUid: WELL_1.uid,
  wellboreUid: WELLBORE_1.uid,
  wellboreName: "",
  wellName: "",
  numStringRun: "",
  tubular: null,
  dTimStart: null,
  dTimStop: null,
  dTimStartDrilling: null,
  dTimStopDrilling: null,
  planDogleg: null,
  actDogleg: null,
  actDoglegMx: null,
  statusBha: "",
  numBitRun: "",
  reasonTrip: "",
  objectiveBha: "",
  commonData: null
};
export const CHANGELOG_1: ChangeLog = {
  uid: "changelog",
  name: "changelog 1",
  wellUid: WELL_1.uid,
  wellboreUid: WELLBORE_1.uid,
  wellboreName: "",
  wellName: "",
  uidObject: "uidObject",
  nameObject: "nameObject",
  lastChangeType: "lastChangeType",
  commonData: null
};
export const FLUIDSREPORT_1 = { uid: "fluidsreport1", name: "FluidsReport 1" };
export const FORMATIONMARKER_1: FormationMarker = {
  uid: "formationMarker",
  name: "formationMarker 1",
  wellUid: WELL_1.uid,
  wellboreUid: WELLBORE_1.uid,
  wellboreName: "",
  wellName: ""
};
export const LOG_1: LogObject = {
  uid: "log1",
  name: "Log 1",
  wellUid: WELL_1.uid,
  wellboreUid: WELLBORE_1.uid,
  wellboreName: "",
  wellName: ""
};
export const RIG_1 = { uid: "rig1", name: "Rig 1" };
export const TRAJECTORY_1: Trajectory = {
  uid: "trajectory1",
  name: "Trajectory 1",
  wellUid: "",
  wellboreUid: "",
  wellboreName: "",
  wellName: "",
  aziRef: "",
  mdMax: getMeasureWithDatum(),
  mdMin: getMeasureWithDatum(),
  trajectoryStations: [],
  dTimTrajEnd: null,
  dTimTrajStart: null,
  commonData: null
};
export const MESSAGE_1 = {
  dateTimeLastChange: "2021-03-03T18:00:24.439+01:00",
  messageText: "Fill Brine Storage 2 with drillwater",
  name: "Surface Logging Data - Message - MSG1",
  uid: "MSG1",
  wellName: "",
  wellUid: "",
  wellboreName: "",
  wellboreUid: ""
};
export const MUDLOG_1 = {
  uid: "123"
};
export const RISK_1 = {
  dateTimeLastChange: "2021-03-03T18:00:24.439+01:00",
  name: "Dangerous risk",
  uid: "MSG1",
  wellName: "",
  wellUid: "",
  wellboreName: "",
  wellboreUid: ""
};
export const TUBULAR_1 = {
  uid: "TUB1",
  wellUid: "",
  wellboreUid: "",
  name: "tubby",
  typeTubularAssy: "drilling"
};
export const WBGEOMETRY_1 = {
  dateTimeLastChange: "2021-03-03T18:00:24.439+01:00",
  uid: "WBG1",
  wellName: "",
  wellUid: "",
  wellboreName: "",
  wellboreUid: ""
};
