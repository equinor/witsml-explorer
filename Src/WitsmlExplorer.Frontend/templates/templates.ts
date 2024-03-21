import attachment from "templates/all/attachment.xml?raw";
import bhaRun from "templates/all/bhaRun.xml?raw";
import cementJob from "templates/all/cementJob.xml?raw";
import changeLog from "templates/all/changeLog.xml?raw";
import convCore from "templates/all/convCore.xml?raw";
import drillReport from "templates/all/drillReport.xml?raw";
import fluidsReport from "templates/all/fluidsReport.xml?raw";
import formationMarker from "templates/all/formationMarker.xml?raw";
import log from "templates/all/log.xml?raw";
import message from "templates/all/message.xml?raw";
import mudLog from "templates/all/mudLog.xml?raw";
import objectGroup from "templates/all/objectGroup.xml?raw";
import opsReport from "templates/all/opsReport.xml?raw";
import rig from "templates/all/rig.xml?raw";
import risk from "templates/all/risk.xml?raw";
import sidewallCore from "templates/all/sidewallCore.xml?raw";
import stimJob from "templates/all/stimJob.xml?raw";
import surveyProgram from "templates/all/surveyProgram.xml?raw";
import target from "templates/all/target.xml?raw";
import toolErrorModel from "templates/all/toolErrorModel.xml?raw";
import toolErrorTermSet from "templates/all/toolErrorTermSet.xml?raw";
import trajectory from "templates/all/trajectory.xml?raw";
import tubular from "templates/all/tubular.xml?raw";
import wbGeometry from "templates/all/wbGeometry.xml?raw";
import well from "templates/all/well.xml?raw";
import wellbore from "templates/all/wellbore.xml?raw";
import changeLogIdOnly from "templates/changeLog_id-only.xml?raw";
import logDataOnly from "templates/log_data-only.xml?raw";
import logHeaderOnly from "templates/log_header-only.xml?raw";
import mudLogDataOnly from "templates/mudLog_data-only.xml?raw";
import mudLogHeaderOnly from "templates/mudLog_header-only.xml?raw";
import objectIdOnly from "templates/object_id-only.xml?raw";
import trajectoryDataOnly from "templates/trajectory_data-only.xml?raw";
import trajectoryHeaderOnly from "templates/trajectory_header-only.xml?raw";
import trajectoryStationLocationOnly from "templates/trajectory_station-location-only.xml?raw";
import wellIdOnly from "templates/well_id-only.xml?raw";
import wellboreIdOnly from "templates/wellbore_id-only.xml?raw";

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
