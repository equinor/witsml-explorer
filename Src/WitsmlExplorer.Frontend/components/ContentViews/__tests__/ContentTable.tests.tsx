import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MockResizeObserver,
  renderWithContexts
} from "__testUtils__/testUtils";
import { ContentTable } from "components/ContentViews/table/ContentTable";
import {
  ContentTableRow,
  ContentType
} from "components/ContentViews/table/tableParts";

describe("<ContentTable />", () => {
  //mock ResizeObserver to enable testing virtualized components
  window.ResizeObserver = MockResizeObserver;
  const columns = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "field", label: "Field", type: ContentType.String }
  ];

  const data = [
    { uid: "uid1", name: "n1", field: "f1" },
    { uid: "uid2", name: "n2", field: "f2" }
  ];

  it("Should render a plain table", () => {
    const { container } = renderWithContexts(
      <ContentTable columns={columns} data={data} showPanel={false} />
    );
    expect(container.querySelectorAll("table")).toHaveLength(1);
    expect(container.querySelectorAll("th")).toHaveLength(columns.length + 2);
    data.forEach((element) => {
      expect(container.querySelector("tbody")).toHaveTextContent(element.name);
      expect(container.querySelector("tbody")).toHaveTextContent(element.field);
    });
  });

  it("Should have sortable columns", () => {
    const { container } = renderWithContexts(
      <ContentTable columns={columns} data={data} showPanel={false} />
    );
    let firstRow = container.querySelector("tbody").querySelector("tr");
    expect(firstRow.querySelectorAll("td")[1]).toHaveTextContent(data[0].name);

    fireEvent.click(screen.queryAllByRole("button")[0]);
    firstRow = container.querySelector("tbody").querySelector("tr");
    expect(firstRow.querySelectorAll("td")[1]).toHaveTextContent(data[0].name);

    fireEvent.click(screen.queryAllByRole("button")[0]);
    firstRow = container.querySelector("tbody").querySelector("tr");
    expect(firstRow.querySelectorAll("td")[1]).toHaveTextContent(data[1].name);
  });

  it("Should be possible to select single rows", () => {
    let selections = 0;
    let selectedRow;
    const onSelect = (row: ContentTableRow) => {
      selectedRow = row;
      selections++;
    };
    const { container } = renderWithContexts(
      <ContentTable
        columns={columns}
        data={data}
        onSelect={onSelect}
        showPanel={false}
      />
    );
    const rowToSelect = 1;
    const cellToClick = container.querySelector("tbody").querySelectorAll("tr")[
      rowToSelect
    ].children[1];
    fireEvent.click(cellToClick);
    expect(selections).toBe(1);
    expect(selectedRow).toBe(data[rowToSelect]);
  });

  it("Should render a table with checkable rows", () => {
    const { container } = renderWithContexts(
      <ContentTable
        columns={columns}
        data={data}
        checkableRows
        showPanel={false}
      />
    );

    const bodyRows = container.querySelector("tbody").querySelectorAll("tr");
    expect(bodyRows).toHaveLength(data.length);
    bodyRows.forEach((row) => {
      expect(row.querySelectorAll("input")).toHaveLength(1);
    });
  });

  it("Tables with checkable rows should display the number of checked rows", async () => {
    const noSelectedRegex = new RegExp(`Row: 0/${data.length}`, "i");
    const oneSelectedRegex = new RegExp(`Row: 1/${data.length}`, "i");
    const allSelectedRegex = new RegExp(
      `Row: ${data.length}/${data.length}`,
      "i"
    );

    const user = userEvent.setup();
    renderWithContexts(
      <ContentTable columns={columns} data={data} checkableRows />
    );
    const [toggleAll, ...toggleRows] = screen.getAllByRole("checkbox");
    const selected = screen.getByText(/row:/i);

    expect(selected).toHaveTextContent(noSelectedRegex);

    await user.click(toggleRows[0]);
    expect(selected).toHaveTextContent(oneSelectedRegex);

    await user.click(toggleRows[0]);
    expect(selected).toHaveTextContent(noSelectedRegex);

    await user.click(toggleAll);
    expect(selected).toHaveTextContent(allSelectedRegex);

    await user.click(toggleAll);
    expect(selected).toHaveTextContent(noSelectedRegex);
  });

  it("Tables without checkable rows should display the number of items", async () => {
    const numberOfItemsRegex = new RegExp(`items: ${data.length}`, "i");

    renderWithContexts(<ContentTable columns={columns} data={data} />);
    const selected = screen.getByText(/items:/i);

    expect(selected).toHaveTextContent(numberOfItemsRegex);
  });

  it("Tables with showRefresh=True should show a refresh button", async () => {
    renderWithContexts(
      <ContentTable columns={columns} data={data} showRefresh />
    );
    expect(
      screen.getByRole("button", { name: /refresh/i })
    ).toBeInTheDocument();
  });
});
