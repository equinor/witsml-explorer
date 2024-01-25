import attachment from "templates/all/attachment.xml";
import bhaRun from "templates/all/bhaRun.xml";
import cementJob from "templates/all/cementJob.xml";
import changeLog from "templates/all/changeLog.xml";
import convCore from "templates/all/convCore.xml";
import drillReport from "templates/all/drillReport.xml";
import fluidsReport from "templates/all/fluidsReport.xml";
import formationMarker from "templates/all/formationMarker.xml";
import log from "templates/all/log.xml";
import message from "templates/all/message.xml";
import mudLog from "templates/all/mudLog.xml";
import objectGroup from "templates/all/objectGroup.xml";
import opsReport from "templates/all/opsReport.xml";
import rig from "templates/all/rig.xml";
import risk from "templates/all/risk.xml";
import sidewallCore from "templates/all/sidewallCore.xml";
import stimJob from "templates/all/stimJob.xml";
import surveyProgram from "templates/all/surveyProgram.xml";
import target from "templates/all/target.xml";
import toolErrorModel from "templates/all/toolErrorModel.xml";
import toolErrorTermSet from "templates/all/toolErrorTermSet.xml";
import trajectory from "templates/all/trajectory.xml";
import tubular from "templates/all/tubular.xml";
import wbGeometry from "templates/all/wbGeometry.xml";
import well from "templates/all/well.xml";
import wellbore from "templates/all/wellbore.xml";
import changeLogIdOnly from "templates/changeLog_id-only.xml";
import logDataOnly from "templates/log_data-only.xml";
import logHeaderOnly from "templates/log_header-only.xml";
import mudLogDataOnly from "templates/mudLog_data-only.xml";
import mudLogHeaderOnly from "templates/mudLog_header-only.xml";
import objectIdOnly from "templates/object_id-only.xml";
import trajectoryDataOnly from "templates/trajectory_data-only.xml";
import trajectoryHeaderOnly from "templates/trajectory_header-only.xml";
import trajectoryStationLocationOnly from "templates/trajectory_station-location-only.xml";
import wellIdOnly from "templates/well_id-only.xml";
import wellboreIdOnly from "templates/wellbore_id-only.xml";

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
