import { TextField, Typography } from "@equinor/eds-core-react";
import { ExpandedState, RowSelectionState } from "@tanstack/react-table";
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
import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import { QueryActionType, QueryContext } from "contexts/queryContext";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { cloneDeep, debounce } from "lodash";
import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import styled from "styled-components";
import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { getDataGridTemplate } from "templates/dataGrid/DataGridTemplates";

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
};

export default function QueryDataGrid() {
  const {
    queryState: { queries, tabIndex },
    dispatchQuery
  } = useContext(QueryContext);

  const { query, tabId } = queries[tabIndex];
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const parser = new XMLParser(parserOptions);
  const builder = new XMLBuilder(parserOptions);
  const queryObj = parser.parse(query);
  const templateObject = Object.keys(queryObj)?.[0]?.slice(0, -1);
  const template = getDataGridTemplate(templateObject as TemplateObjects);
  const data = mergeTemplateWithQuery(template, queryObj);
  const rowSelection = getRowSelectionFromQuery(data);

  useEffect(() => {
    const newExpanded = getExpandedRowsFromQuery(data);
    setExpanded(newExpanded);
  }, [tabIndex]);

  const columns: ContentTableColumn[] = useMemo(
    () => [
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
    ],
    []
  );

  const onRowSelectionChange = (rows: QueryGridDataRow[]) => {
    const dataClone = cloneDeep(data);
    const selectedRowIds = new Set(rows.map((row) => row.id));
    const rowWasAdded = rows.length > Object.keys(rowSelection).length;

    const updatePresentInQuery = (
      node: QueryGridDataRow,
      parentRows: QueryGridDataRow[]
    ) => {
      if (selectedRowIds.has(node.id)) {
        node.presentInQuery = true;
        if (rowWasAdded) {
          parentRows.forEach((row) => {
            row.presentInQuery = true;
          });
        }
      } else {
        node.presentInQuery = false;
        node.value = null;
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) =>
          updatePresentInQuery(child, [...parentRows, node])
        );
      }
    };

    dataClone.forEach((node) => updatePresentInQuery(node, []));

    updateQueryFromData(dataClone);
  };

  const updateQueryFromData = (data: QueryGridDataRow[]) => {
    const generatedQueryObj = extractQueryFromData(data);
    const generatedQuery = builder.build(generatedQueryObj);
    const formattedGeneratedQuery = generatedQuery
      ? formatXml(generatedQuery)
      : "";

    dispatchQuery({
      type: QueryActionType.SetQuery,
      query: formattedGeneratedQuery
    });
  };

  const handleChangeDebounced = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>, rowId: string) => {
      const dataClone = cloneDeep(data);
      const value = e.target.value;

      const updateRowValueById = (
        rows: QueryGridDataRow[],
        parentRows: QueryGridDataRow[]
      ) => {
        for (const row of rows) {
          if (row.id === rowId) {
            row.value = value;
            row.presentInQuery = true;
            parentRows.forEach((row) => {
              row.presentInQuery = true;
            });
            return;
          }

          if (row.children) {
            updateRowValueById(row.children, [...parentRows, row]);
          }
        }
      };
      updateRowValueById(dataClone, []);
      updateQueryFromData(dataClone);
    }, 700),
    [data]
  );

  const tableData = useMemo(() => {
    const getTableData = (dataRows: QueryGridDataRow[]): QueryGridDataRow[] => {
      return dataRows.map((row) => ({
        ...row,
        value: (
          <StyledTextField
            key={row.value === undefined ? `toggle-${row.id}` : row.id}
            id={row.id}
            defaultValue={row.value ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChangeDebounced(e, row.id)
            }
            onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
            disabled={row.isContainer}
          />
        ),
        children: row.children ? getTableData(row.children) : undefined
      }));
    };

    return getTableData(data);
  }, [data]);

  return tableData?.length > 0 ? (
    <div style={{ height: "0", minHeight: "100%" }}>
      <ContentTable
        key={tabId}
        viewId="queryDataGrid"
        columns={columns}
        data={tableData}
        nested
        nestedProperty="children"
        checkableRows
        onRowSelectionChange={onRowSelectionChange}
        onExpandedChange={setExpanded}
        rowSelection={rowSelection}
        expanded={expanded}
        stickyLeftColumns={2}
      />
    </div>
  ) : (
    <Typography>
      {Object.values(TemplateObjects).includes(
        templateObject as TemplateObjects
      ) && !template
        ? `Data Grid is not yet supported for ${pluralize(templateObject)}.`
        : "Unable to parse query."}
    </Typography>
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

const getRowSelectionFromQuery = (
  data: QueryGridDataRow[]
): RowSelectionState => {
  const result: RowSelectionState = {};

  const traverse = (rows: QueryGridDataRow[]) => {
    for (const row of rows) {
      if (row.presentInQuery) {
        result[row.id] = true;
      }
      if (row.children) {
        traverse(row.children);
      }
    }
  };

  traverse(data);
  return result;
};

const getExpandedRowsFromQuery = (
  data: QueryGridDataRow[],
  expandLevels: number = 2 // By default expand the first two levels (the main object - logs and each log)
): ExpandedState => {
  const result: ExpandedState = {};

  const traverse = (rows: QueryGridDataRow[], level: number) => {
    for (const row of rows) {
      if (row.children) {
        result[row.id] = true;
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
  display: flex;
  align-items: center;

  div {
    background-color: transparent;
  }

  width: 100%;
  height: 100%;
`;
