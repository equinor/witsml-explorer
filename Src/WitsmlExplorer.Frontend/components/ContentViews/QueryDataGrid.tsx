import { Typography } from "@equinor/eds-core-react";
import {
  formatXml,
  TemplateObjects
} from "components/ContentViews/QueryViewUtils";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { QueryActionType, QueryContext } from "contexts/queryContext";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { cloneDeep } from "lodash";
import { useContext, useMemo } from "react";
import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { getDataGridTemplate } from "templates/dataGrid/DataGridTemplates";

export interface QueryDataGridProps {}

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
};

export default function QueryDataGrid() {
  const {
    queryState: { queries, tabIndex },
    dispatchQuery
  } = useContext(QueryContext);
  const { query } = queries[tabIndex];

  const parser = useMemo(() => new XMLParser(parserOptions), []);
  const builder = useMemo(() => new XMLBuilder(parserOptions), []);
  const queryObj = useMemo(() => parser.parse(query), [query]);

  const templateObject = Object.keys(queryObj)?.[0]?.slice(0, -1);

  const template = useMemo(
    () => getDataGridTemplate(templateObject as TemplateObjects),
    []
  );

  const data = useMemo(
    () => mergeTemplateWithQuery(template, queryObj),
    [template, queryObj]
  );

  const initiallySelectedRows = useMemo(
    () => getInitiallySelectedRows(data),
    []
  );

  const initiallyExpandedRows = useMemo(
    () => getInitiallyExpandedRows(data),
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

  const onRowSelectionChange = (rows: QueryGridDataRow[]) => {
    const dataClone = cloneDeep(data);
    const selectedRowIds = new Set(rows.map((row) => row.id));

    const updatePresentInQuery = (node: QueryGridDataRow) => {
      node.presentInQuery = selectedRowIds.has(node.id);

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => updatePresentInQuery(child));
      }
    };

    dataClone.forEach((node) => updatePresentInQuery(node));

    const generatedQueryObj = extractQueryFromData(dataClone);
    const generatedQuery = builder.build(generatedQueryObj);
    const formattedGeneratedQuery = formatXml(generatedQuery);

    dispatchQuery({
      type: QueryActionType.SetQuery,
      query: formattedGeneratedQuery
    });
  };

  return data?.length > 0 ? (
    <ContentTable
      columns={columns}
      data={data}
      nested
      nestedProperty="children"
      checkableRows
      onRowSelectionChange={onRowSelectionChange}
      initiallySelectedRows={initiallySelectedRows}
      initiallyExpandedRows={initiallyExpandedRows}
    />
  ) : (
    <Typography>Unable to parse query</Typography>
  );
}

interface QueryGridDataRow extends ContentTableRow {
  name: string;
  documentation: string;
  value: any;
  isAttribute?: boolean;
  isContainer?: boolean;
  isMultiple?: boolean;
  children?: QueryGridDataRow[];
  presentInQuery?: boolean;
}

const mergeTemplateWithQuery = (
  template: DataGridProperty,
  queryObj: any
): QueryGridDataRow[] => {
  const processTemplate = (
    templateNode: DataGridProperty,
    queryNode: any,
    parentId: string = "",
    index: number | null = null
  ): QueryGridDataRow => {
    const { name, documentation, isContainer, isAttribute, properties } =
      templateNode;

    const uniqueId =
      (parentId ? `${parentId}--` : "") +
      name +
      (index != null ? `[${index}]` : "");

    let value = null;
    const children: QueryGridDataRow[] = [];
    const presentInQuery = queryNode !== undefined;

    if (!isContainer) {
      value = typeof queryNode === "object" ? queryNode?.["#text"] : queryNode;
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
      isContainer,
      presentInQuery,
      children: children.length > 0 ? children : undefined
    };
  };

  if (!template) return [];

  const mergedRows = [processTemplate(template, queryObj[template.name])];

  return mergedRows;
};

const extractQueryFromData = (data: QueryGridDataRow[]): any => {
  function buildQuery(row: QueryGridDataRow): any {
    const { value, isAttribute, children, presentInQuery } = row;

    if (!presentInQuery) {
      return undefined;
    }

    const queryNode: any = {};

    if (isAttribute) {
      return value ?? "";
    } else {
      queryNode["#text"] = value ?? "";
    }

    children?.forEach((child) => {
      const childQuery = buildQuery(child);
      if (childQuery !== undefined) {
        const childName = child.isAttribute ? `@_${child.name}` : child.name;
        if (Array.isArray(queryNode[childName])) {
          queryNode[childName].push(childQuery);
        } else if (queryNode[childName]) {
          // If we have multiple of the same object, move the items to an array.
          queryNode[childName] = [queryNode[childName], childQuery];
        } else {
          queryNode[childName] = childQuery;
        }
      }
    });

    return Object.keys(queryNode).length ? queryNode : undefined;
  }

  const queryObj: any = {};

  data.forEach((row) => {
    const rowQuery = buildQuery(row);
    if (rowQuery !== undefined) {
      queryObj[row.name] = rowQuery;
    }
  });

  return queryObj;
};

const getInitiallySelectedRows = (
  data: QueryGridDataRow[]
): QueryGridDataRow[] => {
  const result: QueryGridDataRow[] = [];

  const traverse = (rows: QueryGridDataRow[]) => {
    for (const row of rows) {
      if (row.presentInQuery) {
        result.push(row);
      }
      if (row.children) {
        traverse(row.children);
      }
    }
  };

  traverse(data);
  return result;
};

const getInitiallyExpandedRows = (
  data: QueryGridDataRow[],
  expandLevels: number = 2 // By default expand the first two levels (the main object - logs and each log)
): QueryGridDataRow[] => {
  const result: QueryGridDataRow[] = [];

  const traverse = (rows: QueryGridDataRow[], level: number) => {
    for (const row of rows) {
      if (row.children) {
        result.push(row);
        if (level < expandLevels) {
          traverse(row.children, level + 1);
        }
      }
    }
  };
  traverse(data, 1);
  return result;
};
