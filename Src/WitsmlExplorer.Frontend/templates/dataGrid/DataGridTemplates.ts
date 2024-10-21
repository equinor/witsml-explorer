import { TemplateObjects } from "components/ContentViews/QueryViewUtils";
import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridAttachment } from "templates/dataGrid/objects/DataGridAttachment";
import { dataGridBhaRun } from "templates/dataGrid/objects/DataGridBhaRun";
import { dataGridCementJob } from "templates/dataGrid/objects/DataGridCementJob";
import { dataGridChangeLog } from "templates/dataGrid/objects/DataGridChangeLog";
import { dataGridConvCore } from "templates/dataGrid/objects/DataGridConvCore";
import { dataGridFluidsReport } from "templates/dataGrid/objects/DataGridFluidsReport";
import { dataGridFormationMarker } from "templates/dataGrid/objects/DataGridFormationMarker";
import { dataGridLog } from "templates/dataGrid/objects/DataGridLog";
import { dataGridMessage } from "templates/dataGrid/objects/DataGridMessage";
import { dataGridMudLog } from "templates/dataGrid/objects/DataGridMudLog";
import { dataGridRig } from "templates/dataGrid/objects/DataGridRig";
import { dataGridRisk } from "templates/dataGrid/objects/DataGridRisk";
import { dataGridTrajectory } from "templates/dataGrid/objects/DataGridTrajectory";
import { dataGridTubular } from "templates/dataGrid/objects/DataGridTubular";
import { dataGridWbGeometry } from "templates/dataGrid/objects/DataGridWbGeometry";
import { dataGridWell } from "templates/dataGrid/objects/DataGridWell";
import { dataGridWellbore } from "templates/dataGrid/objects/DataGridWellbore";

export const getDataGridTemplate = (
  templateObject: TemplateObjects
): DataGridProperty => {
  switch (templateObject) {
    case TemplateObjects.Attachment:
      return dataGridAttachment;
    case TemplateObjects.BhaRun:
      return dataGridBhaRun;
    case TemplateObjects.CementJob:
      return dataGridCementJob;
    case TemplateObjects.ChangeLog:
      return dataGridChangeLog;
    case TemplateObjects.ConvCore:
      return dataGridConvCore;
    case TemplateObjects.FluidsReport:
      return dataGridFluidsReport;
    case TemplateObjects.FormationMarker:
      return dataGridFormationMarker;
    case TemplateObjects.Log:
      return dataGridLog;
    case TemplateObjects.Message:
      return dataGridMessage;
    case TemplateObjects.MudLog:
      return dataGridMudLog;
    case TemplateObjects.Rig:
      return dataGridRig;
    case TemplateObjects.Risk:
      return dataGridRisk;
    case TemplateObjects.Trajectory:
      return dataGridTrajectory;
    case TemplateObjects.Tubular:
      return dataGridTubular;
    case TemplateObjects.WbGeometry:
      return dataGridWbGeometry;
    case TemplateObjects.Well:
      return dataGridWell;
    case TemplateObjects.Wellbore:
      return dataGridWellbore;
    default:
      console.error(
        `No data grid template is yet defined for ${templateObject}`
      );
      return null;
  }
};
