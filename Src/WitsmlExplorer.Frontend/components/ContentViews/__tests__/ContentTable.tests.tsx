import * as React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContentTable, ContentTableRow, ContentType } from "../table";

describe("<ContentTable />", () => {
  const columns = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "field", label: "Field", type: ContentType.String }
  ];

  const data = [
    { uid: "uid1", name: "n1", field: "f1" },
    { uid: "uid2", name: "n2", field: "f2" }
  ];

  it("Should render a plain table", () => {
    const { container } = render(<ContentTable columns={columns} data={data} />);
    expect(container.querySelectorAll("table")).toHaveLength(1);
    expect(container.querySelectorAll("th")).toHaveLength(columns.length);
    data.forEach((element) => {
      expect(container.querySelector("tbody")).toHaveTextContent(element.name);
      expect(container.querySelector("tbody")).toHaveTextContent(element.field);
    });
  });

  it("Should have sortable columns", () => {
    const { container } = render(<ContentTable columns={columns} data={data} />);
    let firstRow = container.querySelector("tbody").querySelector("tr");
    expect(firstRow.querySelector("td")).toHaveTextContent(data[0].name);

    fireEvent.click(screen.queryAllByRole("button")[0]);
    firstRow = container.querySelector("tbody").querySelector("tr");
    expect(firstRow.querySelector("td")).toHaveTextContent(data[1].name);

    fireEvent.click(screen.queryAllByRole("button")[0]);
    firstRow = container.querySelector("tbody").querySelector("tr");
    expect(firstRow.querySelector("td")).toHaveTextContent(data[0].name);
  });

  it("Should be possible to select single rows", () => {
    let selections = 0;
    let selectedRow;
    const onSelect = (row: ContentTableRow) => {
      selectedRow = row;
      selections++;
    };
    const { container } = render(<ContentTable columns={columns} data={data} onSelect={onSelect} />);
    const rowToSelect = 1;
    const cellToClick = container.querySelector("tbody").querySelectorAll("tr")[rowToSelect].children[0];
    fireEvent.click(cellToClick);
    expect(selections).toBe(1);
    expect(selectedRow).toBe(data[rowToSelect]);
  });

  it("Should render a table with checkable rows", () => {
    const { container } = render(<ContentTable columns={columns} data={data} checkableRows />);

    const bodyRows = container.querySelector("tbody").querySelectorAll("tr");
    expect(bodyRows).toHaveLength(data.length);
    bodyRows.forEach((row) => {
      expect(row.querySelectorAll("input")).toHaveLength(1);
    });
  });
});
