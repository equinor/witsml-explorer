import { TemplateObjects } from "components/ContentViews/QueryViewUtils";
import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridAttachment } from "templates/dataGrid/objects/DataGridAttachment";
import { dataGridBhaRun } from "templates/dataGrid/objects/DataGridBhaRun";
import { dataGridChangeLog } from "templates/dataGrid/objects/DataGridChangeLog";

export const getDataGridTemplate = (
  templateObject: TemplateObjects
): DataGridProperty => {
  switch (templateObject) {
    case TemplateObjects.Attachment:
      return dataGridAttachment;
    case TemplateObjects.BhaRun:
      return dataGridBhaRun;
    case TemplateObjects.ChangeLog:
      return dataGridChangeLog;
    default:
      console.error(
        `No data grid template is yet defined for ${templateObject}`
      );
      return null;
  }
};
