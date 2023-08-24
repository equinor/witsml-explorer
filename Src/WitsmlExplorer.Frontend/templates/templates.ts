import attachment from "./all/attachment.xml";
import bhaRun from "./all/bhaRun.xml";
import cementJob from "./all/cementJob.xml";
import changeLog from "./all/changeLog.xml";
import convCore from "./all/convCore.xml";
import drillReport from "./all/drillReport.xml";
import fluidsReport from "./all/fluidsReport.xml";
import formationMarker from "./all/formationMarker.xml";
import log from "./all/log.xml";
import message from "./all/message.xml";
import mudLog from "./all/mudLog.xml";
import objectGroup from "./all/objectGroup.xml";
import opsReport from "./all/opsReport.xml";
import rig from "./all/rig.xml";
import risk from "./all/risk.xml";
import sidewallCore from "./all/sidewallCore.xml";
import stimJob from "./all/stimJob.xml";
import surveyProgram from "./all/surveyProgram.xml";
import target from "./all/target.xml";
import toolErrorModel from "./all/toolErrorModel.xml";
import toolErrorTermSet from "./all/toolErrorTermSet.xml";
import trajectory from "./all/trajectory.xml";
import tubular from "./all/tubular.xml";
import wbGeometry from "./all/wbGeometry.xml";
import well from "./all/well.xml";
import wellbore from "./all/wellbore.xml";
import changeLogIdOnly from "./changeLog_id-only.xml";
import logDataOnly from "./log_data-only.xml";
import logHeaderOnly from "./log_header-only.xml";
import mudLogDataOnly from "./mudLog_data-only.xml";
import mudLogHeaderOnly from "./mudLog_header-only.xml";
import objectIdOnly from "./object_id-only.xml";
import trajectoryDataOnly from "./trajectory_data-only.xml";
import trajectoryHeaderOnly from "./trajectory_header-only.xml";
import trajectoryStationLocationOnly from "./trajectory_station-location-only.xml";
import wellIdOnly from "./well_id-only.xml";
import wellboreIdOnly from "./wellbore_id-only.xml";

export const templates: Record<string, string> = {
  changeLogIdOnly,
  logDataOnly,
  logHeaderOnly,
  mudLogDataOnly,
  mudLogHeaderOnly,
  objectIdOnly,
  trajectoryDataOnly,
  trajectoryHeaderOnly,
  trajectoryStationLocationOnly,
  wellIdOnly,
  wellboreIdOnly,
  attachment,
  bhaRun,
  cementJob,
  changeLog,
  convCore,
  drillReport,
  fluidsReport,
  formationMarker,
  log,
  message,
  mudLog,
  objectGroup,
  opsReport,
  rig,
  risk,
  sidewallCore,
  stimJob,
  surveyProgram,
  target,
  toolErrorModel,
  toolErrorTermSet,
  trajectory,
  tubular,
  wbGeometry,
  well,
  wellbore
};
