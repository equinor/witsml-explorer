import * as React from "react";
import { mount } from "enzyme";
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
    const table = mount(<ContentTable columns={columns} data={data} />);
    const headerRow = table.find("thead").find("tr");
    expect(headerRow.find("th")).toHaveLength(columns.length);
    const headerCells = headerRow.find("th").children();
    expect(headerCells).toHaveLength(columns.length);

    const bodyRows = table.find("tbody").find("tr");
    expect(bodyRows).toHaveLength(data.length);

    const firstRow = bodyRows.at(0);
    expect(firstRow.children()).toHaveLength(columns.length);

    expect(firstRow.childAt(0).text()).toBe(data[0].name);
    expect(firstRow.childAt(1).text()).toBe(data[0].field);
    const secondRow = bodyRows.at(1);
    expect(secondRow.children()).toHaveLength(columns.length);
    expect(secondRow.childAt(0).text()).toBe(data[1].name);
    expect(secondRow.childAt(1).text()).toBe(data[1].field);
  });

  it("Should have sortable columns", () => {
    const table = mount(<ContentTable columns={columns} data={data} />);
    let firstRow = table.find("tbody").find("tr").first();
    expect(firstRow.find("td").first().text()).toBe(data[0].name);

    sortByName();
    firstRow = table.find("tbody").find("tr").first();
    expect(firstRow.find("td").first().text()).toBe(data[1].name);

    sortByName();
    firstRow = table.find("tbody").find("tr").first();
    expect(firstRow.find("td").first().text()).toBe(data[0].name);

    function sortByName() {
      const nameHeaderCell = table.find("thead").find("tr").find("th").find("span").at(0);
      nameHeaderCell.simulate("click");
    }
  });

  it("Should be possible to select single rows", () => {
    let selections = 0;
    let selectedRow;
    const onSelect = (row: ContentTableRow) => {
      selectedRow = row;
      selections++;
    };
    const table = mount(<ContentTable columns={columns} data={data} onSelect={onSelect} />);
    const rowToSelect = 1;
    const firstRow = table.find("tbody").find("tr").at(rowToSelect).childAt(0);
    firstRow.simulate("click");
    expect(selections).toBe(1);
    expect(selectedRow).toBe(data[rowToSelect]);
  });

  it("Should render a table with checkable rows", () => {
    const table = mount(<ContentTable columns={columns} data={data} checkableRows />);
    const headerRow = table.find("thead").find("tr");

    expect(headerRow.find("th")).toHaveLength(columns.length + 1);
    const headerCells = headerRow.find("th").children();
    expect(headerCells).toHaveLength(columns.length + 1);
    const bodyRows = table.find("tbody").find("tr");
    expect(bodyRows).toHaveLength(data.length);
    const firstRow = bodyRows.at(0);
    expect(firstRow.children()).toHaveLength(columns.length + 1);
    expect(firstRow.childAt(0).find("input").length).toBe(1);
    expect(firstRow.childAt(1).text()).toBe(data[0].name);
    expect(firstRow.childAt(2).text()).toBe(data[0].field);
    const secondRow = bodyRows.at(1);
    expect(secondRow.children()).toHaveLength(columns.length + 1);
    expect(secondRow.childAt(0).find("input").length).toBe(1);
    expect(secondRow.childAt(1).text()).toBe(data[1].name);
    expect(secondRow.childAt(2).text()).toBe(data[1].field);
  });
});
