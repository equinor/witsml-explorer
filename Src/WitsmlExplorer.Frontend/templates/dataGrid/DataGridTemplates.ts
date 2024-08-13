import { TemplateObjects } from "components/ContentViews/QueryViewUtils";
import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import attachment from "templates/dataGrid/attachment.json";

export const templates: Record<string, DataGridProperty> = {
  attachment
};

export const getDataGridTemplate = (templateObject: TemplateObjects) => {
  return templates[templateObject];
};
