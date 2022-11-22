import { CellProps, Table } from "@equinor/eds-core-react";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Icon from "../../../styles/Icons";

export type SortDirection = "ascending" | "descending" | "none";

export type Column = {
  name: string | React.ReactNode;
  accessor: string;
  sortDirection?: SortDirection;
  isSorted?: boolean;
};

type State = {
  columns: Column[];
  cellValues?: string[][];
};

export interface SortableEdsTableProps {
  columns: Column[];
  data: Record<string, any>[];
  caption: React.ReactNode;
}

//Source: equinor/design-system/packages/eds-core-react/src/components/Table/Table.stories.tsx v0.27.0 bde787d
const SortableEdsTable = (props: SortableEdsTableProps): React.ReactElement => {
  const { columns, data, caption } = props;

  const initColumns = (): Column[] =>
    columns.map((col) => {
      return {
        ...col,
        ...(col.isSorted === undefined ? { isSorted: false } : { isSorted: col.isSorted }),
        ...(col.sortDirection === undefined ? { sortDirection: "none" } : { sortDirection: col.sortDirection })
      };
    });
  const [state, setState] = useState<State>({ columns: initColumns() });

  const onSortClick = (sortCol: Column) => {
    const updateColumns = state.columns.map((col) => {
      if (sortCol.accessor === col.accessor) {
        let sortDirection: SortDirection = "none";
        switch (sortCol.sortDirection) {
          case "ascending":
            sortDirection = "descending";
            break;
          default:
            sortDirection = "ascending";
            break;
        }
        return {
          ...sortCol,
          isSorted: true,
          sortDirection
        };
      }
      return {
        ...col,
        isSorted: false,
        sortDirection: col.sortDirection ? ("none" as SortDirection) : undefined
      };
    });

    setState({ ...state, columns: updateColumns });
  };

  const sortData = useCallback(
    (data: Record<string, any>[]) =>
      data.sort((left, right) => {
        const sortedCol = state.columns.find((col) => col.isSorted);
        if (!sortedCol) {
          return 1;
        }
        const { sortDirection, accessor } = sortedCol;
        if (sortDirection === "ascending") {
          return left[accessor] > right[accessor] ? 1 : -1;
        }
        if (sortDirection === "descending") {
          return left[accessor] < right[accessor] ? 1 : -1;
        }
      }),
    [state.columns]
  );

  useEffect(() => {
    if (state.columns) {
      const sorted = sortData(data);
      const cellValues = toCellValues(sorted, columns);
      setState((prevState) => ({ ...prevState, cellValues }));
    }
  }, [state.columns, setState, sortData]);

  return (
    <Table>
      <Table.Caption>{caption}</Table.Caption>
      <Table.Head>
        <Table.Row>
          {state.columns.map((col) => (
            <SortCell sort={col.sortDirection} key={`head-${col.accessor}`} onClick={col.sortDirection ? () => onSortClick(col) : undefined} isSorted={col.isSorted}>
              {col.name}
              <Icon name={col.sortDirection === "descending" ? "arrowDown" : "arrowUp"} />
            </SortCell>
          ))}
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {state.cellValues?.map((row) => (
          <Table.Row key={row.toString()}>
            {row.map((cellValue, i) => (
              <Table.Cell key={i}>{cellValue}</Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const toCellValues = (data: Record<string, any>[], columns: Column[]): string[][] =>
  data.map((item) => columns.map((column) => (typeof item[column.accessor] !== "undefined" ? (item[column.accessor] as string) : "")));

const SortCell = styled(Table.Cell)<{ isSorted: boolean } & CellProps>`
  svg {
    visibility: ${({ isSorted }) => (isSorted ? "visible" : "hidden")};
  }
  &:hover {
    svg {
      visibility: visible;
    }
  }
`;

export default SortableEdsTable;
