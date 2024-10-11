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
import { dataGridMudLog } from "templates/dataGrid/objects/DataGridMudLog";
import { dataGridRisk } from "templates/dataGrid/objects/DataGridRisk";
import { dataGridWbGeometry } from "templates/dataGrid/objects/DataGridWbGeometry";

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
    case TemplateObjects.MudLog:
      return dataGridMudLog;
    case TemplateObjects.Risk:
      return dataGridRisk;
    case TemplateObjects.WbGeometry:
      return dataGridWbGeometry;
    default:
      console.error(
        `No data grid template is yet defined for ${templateObject}`
      );
      return null;
  }
};
