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
  const templateObject = queryLines.length >= 2 ? getTag(queryLines[1]) : null;

  const template = useMemo(
    () => getDataGridTemplate(templateObject as TemplateObjects),
    []
  );

  const parser = useMemo(() => new XMLParser({ ignoreAttributes: false }), []);
  const queryObj = useMemo(() => parser.parse(query), [query]);

  const data = useMemo(
    () => mergeTemplateWithQuery(template, queryObj),
    [template, queryObj]
  );
  // const initiallySelectedRows = useMemo(
  //   () => getInitiallySelectedRows(query, template),
  //   []
  // );

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
      data={data}
      nested
      nestedProperty="children"
      checkableRows
      onRowSelectionChange={onRowSelectionChange}
      // initiallySelectedRows={initiallySelectedRows}
    />
  );
}

interface QueryGridDataRow {
  id: string;
  name: string;
  documentation: string;
  value: any;
  isAttribute?: boolean;
  isContainer?: boolean;
  isMultiple?: boolean;
  children?: QueryGridDataRow[];
}

function mergeTemplateWithQuery(
  template: DataGridProperty,
  queryObj: any
): QueryGridDataRow[] {
  function processTemplate(
    templateNode: DataGridProperty,
    queryNode: any,
    parentId: string = "",
    index: number | null = null
  ): QueryGridDataRow {
    const { name, documentation, isContainer, isAttribute, properties } =
      templateNode;
    const uniqueId =
      (parentId ? `${parentId}--` : "") +
      name +
      (index != null ? `[${index}]` : "");

    let value = null;
    const children: QueryGridDataRow[] = [];

    if (!isContainer) {
      value = queryNode?.["#text"] || queryNode;
    }

    if (properties) {
      properties.forEach((prop) => {
        const propQueryName = prop.isAttribute ? `@_${prop.name}` : prop.name;
        const childQueryNode = queryNode?.[propQueryName];
        if (prop.isMultiple && Array.isArray(childQueryNode)) {
          const multiChildren = childQueryNode.map((child, index) =>
            processTemplate(prop, child, uniqueId, index)
          );
          children.push(...multiChildren);
        } else {
          children.push(processTemplate(prop, childQueryNode, uniqueId));
        }
      });
    }

    return {
      id: uniqueId,
      name,
      documentation,
      value,
      isAttribute,
      children: children.length > 0 ? children : undefined
    };
  }

  const mergedRows =
    processTemplate(template, queryObj[template.name])?.children ?? [];

  return mergedRows;
}
