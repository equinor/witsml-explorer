import { TemplateObjects } from "components/ContentViews/QueryViewUtils";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getTag } from "components/QueryEditorUtils";
import { QueryContext } from "contexts/queryContext";
import { XMLParser } from "fast-xml-parser";
import { useContext, useMemo } from "react";
import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { getDataGridTemplate } from "templates/dataGrid/DataGridTemplates";

export interface QueryDataGridProps {}

export default function QueryDataGrid() {
  const {
    queryState: { queries, tabIndex }
  } = useContext(QueryContext);
  const { query } = queries[tabIndex];
  const queryLines = query.split("\n");
  const queryObject = queryLines.length >= 2 ? getTag(queryLines[1]) : null;

  const template = useMemo(
    () => getDataGridTemplate(queryObject as TemplateObjects),
    []
  );
  const initiallySelectedRows = useMemo(
    () => getInitiallySelectedRows(query, template),
    []
  );

  const columns: ContentTableColumn[] = [
    {
      property: "name",
      label: "variable",
      type: ContentType.String
    },
    {
      property: "value",
      label: "value",
      type: ContentType.String //TODO: component?
    },
    {
      property: "documentation",
      label: "documentation",
      type: ContentType.String
    }
  ];

  const onRowSelectionChange = (rows: ContentTableRow[]) => {
    // TODO: Update the query accordingly.
    // eslint-disable-next-line no-console
    console.log("onRowSelectionChange", rows);
  };

  return (
    <ContentTable
      columns={columns}
      data={template.properties}
      nested
      nestedProperty="properties"
      checkableRows
      onRowSelectionChange={onRowSelectionChange}
      initiallySelectedRows={initiallySelectedRows}
    />
  );
}

const getInitiallySelectedRows = (
  query: string,
  template: DataGridProperty
): DataGridProperty[] => {
  // Parse the query XML into an object
  const parser = new XMLParser({ ignoreAttributes: false });
  const queryObj = parser.parse(query);

  const initiallySelectedRows: DataGridProperty[] = [];

  function processTemplate(template: DataGridProperty, queryObj: any) {
    for (const key in queryObj) {
      const cleanKey = key.replace(/^@_/, ""); // Remove "@_" for attribute keys

      if (template.name === cleanKey) {
        initiallySelectedRows.push(template);

        if (template.multiple && Array.isArray(queryObj[key])) {
          for (const item of queryObj[key]) {
            if (template.properties) {
              for (const prop of template.properties) {
                processTemplate(prop, item);
              }
            }
          }
        } else if (template.properties && queryObj[key]) {
          for (const prop of template.properties) {
            processTemplate(prop, queryObj[key]);
          }
        }
      }
    }
  }

  processTemplate(template, queryObj);

  return initiallySelectedRows;
};

// const getInitiallySelectedRows = (query: string, template: DataGridProperty) => {
//     // Match the query to the template to find the template rows that should be selected initially.

//     const parser = new XMLParser({ ignoreAttributes: false });
//     const queryObj = parser.parse(query);

//     console.log("queryObj", queryObj)

//     const initiallySelectedRows: DataGridProperty[] = [];

//     function processTemplate(template: DataGridProperty, queryObj: any) {
//         for (const key in queryObj) {
//             const cleanKey = key.replace(/^@_/, ''); // Remove "@_" for attribute keys
//             if (template.name === cleanKey) {
//                 initiallySelectedRows.push(template);
//                 if (template.properties && queryObj[key]) {
//                     for (const prop of template.properties) {
//                         processTemplate(prop, queryObj[key]);
//                     }
//                 }
//             }
//         }
//     }

//     processTemplate(template, queryObj);

//     return initiallySelectedRows
// }
