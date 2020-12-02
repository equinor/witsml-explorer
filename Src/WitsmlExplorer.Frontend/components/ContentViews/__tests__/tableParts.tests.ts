import { getRowsInRange, ContentTableRow, updateCheckedRows } from "../table/tableParts";

describe("Table parts - getRowsInRange", () => {
  it("Selecting a single row", () => {
    const rows: ContentTableRow[] = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const indexRange = [2, 2];
    const range = getRowsInRange(rows, indexRange);
    expect(range).toHaveLength(1);
    expect(range[0].id).toBe(3);
  });

  it("Selecting an interval with lower start than end", () => {
    const rows: ContentTableRow[] = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const indexRange = [0, 2];
    const range = getRowsInRange(rows, indexRange);
    expect(range).toHaveLength(3);
    expect(range[0].id).toBe(1);
    expect(range[1].id).toBe(2);
    expect(range[2].id).toBe(3);
  });

  it("Selecting an interval with higher start index than end index", () => {
    const rows: ContentTableRow[] = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const indexRange = [2, 0];
    const range = getRowsInRange(rows, indexRange);
    expect(range).toHaveLength(2);
    expect(range).toContainEqual({ id: 1 });
    expect(range).toContainEqual({ id: 2 });
  });
});

describe("Table parts - updateCheckedRows", () => {
  it("Unchecking range", () => {
    const checkedRows: ContentTableRow[] = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }];
    const rangeToToggle: ContentTableRow[] = [{ id: 2 }, { id: 3 }, { id: 4 }];
    const updatedRows = updateCheckedRows(checkedRows, rangeToToggle, false);
    expect(updatedRows).toHaveLength(4);
    expect(updatedRows).toContainEqual({ id: 1 });
    expect(updatedRows).toContainEqual({ id: 5 });
    expect(updatedRows).toContainEqual({ id: 6 });
    expect(updatedRows).toContainEqual({ id: 7 });
  });

  it("Checking range", () => {
    const checkedRows: ContentTableRow[] = [{ id: 5 }];
    const rangeToToggle: ContentTableRow[] = [{ id: 2 }, { id: 3 }, { id: 4 }];
    const updatedRows = updateCheckedRows(checkedRows, rangeToToggle, true);
    expect(updatedRows).toHaveLength(4);
    expect(updatedRows).toContainEqual({ id: 2 });
    expect(updatedRows).toContainEqual({ id: 3 });
    expect(updatedRows).toContainEqual({ id: 4 });
    expect(updatedRows).toContainEqual({ id: 5 });
  });
});
