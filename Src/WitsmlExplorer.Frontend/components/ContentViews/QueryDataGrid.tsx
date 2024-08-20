import { EdsProvider, TextField, Typography } from "@equinor/eds-core-react";
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
import { useOperationState } from "hooks/useOperationState";
import { cloneDeep, debounce } from "lodash";
import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useContext,
  useMemo
} from "react";
import styled from "styled-components";
import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { getDataGridTemplate } from "templates/dataGrid/DataGridTemplates";

export interface QueryDataGridProps {}

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
};

export default function QueryDataGrid() {
  const {
    operationState: { theme }
  } = useOperationState();

  const {
    queryState: { queries, tabIndex },
    dispatchQuery
  } = useContext(QueryContext);

  const { query, tabId } = queries[tabIndex];
  const parser = new XMLParser(parserOptions);
  const builder = new XMLBuilder(parserOptions);
  const queryObj = parser.parse(query);
  const templateObject = Object.keys(queryObj)?.[0]?.slice(0, -1);
  const template = getDataGridTemplate(templateObject as TemplateObjects);
  const data = mergeTemplateWithQuery(template, queryObj);
  const initiallySelectedRows = getInitiallySelectedRows(data);
  const initiallyExpandedRows = getInitiallyExpandedRows(data);

  const columns: ContentTableColumn[] = [
    {
      property: "name",
      label: "variable",
      type: ContentType.String
    },
    {
      property: "value",
      label: "value",
      type: ContentType.Component
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

    updateQueryFromData(dataClone);
  };

  const updateQueryFromData = (data: QueryGridDataRow[]) => {
    const generatedQueryObj = extractQueryFromData(data);
    const generatedQuery = builder.build(generatedQueryObj);
    const formattedGeneratedQuery = formatXml(generatedQuery);

    dispatchQuery({
      type: QueryActionType.SetQuery,
      query: formattedGeneratedQuery
    });
  };

  const handleChangeDebounced = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>, rowId: string) => {
      const dataClone = cloneDeep(data);
      const value = e.target.value;

      const updateRowValueById = (rows: QueryGridDataRow[]) => {
        for (const row of rows) {
          if (row.id === rowId) {
            row.value = value;
            row.presentInQuery = true;
            return;
          }

          if (row.children) {
            updateRowValueById(row.children);
          }
        }
      };
      updateRowValueById(dataClone);
      updateQueryFromData(dataClone);
    }, 1000),
    [data]
  );

  const tableData = useMemo(() => {
    const getTableData = (dataRows: QueryGridDataRow[]): QueryGridDataRow[] => {
      return dataRows.map((row) => ({
        ...row,
        value: !row.isContainer && (
          <StyledTextField
            id={row.id}
            defaultValue={row.value ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChangeDebounced(e, row.id)
            }
            onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
          />
        ),
        children: row.children ? getTableData(row.children) : undefined
      }));
    };

    return getTableData(data);
  }, [data]);

  return tableData?.length > 0 ? (
    <EdsProvider density={theme}>
      <ContentTable
        key={tabId}
        viewId="queryDataGrid"
        columns={columns}
        data={tableData}
        nested
        nestedProperty="children"
        checkableRows
        onRowSelectionChange={onRowSelectionChange}
        initiallySelectedRows={initiallySelectedRows}
        initiallyExpandedRows={initiallyExpandedRows}
      />
    </EdsProvider>
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

const StyledTextField = styled(TextField)`
  div {
    background-color: transparent;
  }
  width: 100%;
`;
