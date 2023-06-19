import { Button } from "@equinor/eds-core-react";
import { Table } from "@tanstack/react-table";
import { ContentTableColumn, expanderId, orderingStorageKey, selectId } from "./tableParts";

export const ColumnToggle = (props: { table: Table<any>; checkableRows: boolean; expandableRows: boolean; viewId: string; columns: ContentTableColumn[] }): React.ReactElement => {
  const { table, checkableRows, expandableRows, viewId, columns } = props;
  const firstToggleableIndex = (checkableRows ? 1 : 0) + (expandableRows ? 1 : 0);
  return (
    <div>
      <div>
        <label>
          <input
            {...{
              type: "checkbox",
              checked: table.getIsAllColumnsVisible(),
              onChange: table.getToggleAllColumnsVisibilityHandler()
            }}
          />{" "}
          Toggle All
        </label>
      </div>
      {table.getAllLeafColumns().map((column) => {
        return (
          column.id != selectId &&
          column.id != expanderId && (
            <div key={column.id}>
              <label>
                <input
                  {...{
                    type: "checkbox",
                    checked: column.getIsVisible(),
                    onChange: column.getToggleVisibilityHandler()
                  }}
                />
                <input
                  {...{
                    type: "button",
                    onClick: () => {
                      const order = table.getAllLeafColumns().map((d) => d.id);
                      const index = order.findIndex((value) => value == column.id);
                      if (index > firstToggleableIndex) {
                        order[index] = order[index - 1];
                        order[index - 1] = column.id;
                      }
                      table.setColumnOrder(order);
                      if (viewId != null) {
                        localStorage.setItem(viewId + orderingStorageKey, JSON.stringify(order));
                      }
                    },
                    value: "^"
                  }}
                />
                <input
                  {...{
                    type: "button",
                    onClick: () => {
                      const order = table.getAllLeafColumns().map((d) => d.id);
                      const index = order.findIndex((value) => value == column.id);
                      if (index < order.length - 1) {
                        order[index] = order[index + 1];
                        order[index + 1] = column.id;
                      }
                      table.setColumnOrder(order);
                      if (viewId != null) {
                        localStorage.setItem(viewId + orderingStorageKey, JSON.stringify(order));
                      }
                    },
                    value: "v"
                  }}
                />{" "}
                {column.columnDef.header.toString()}
              </label>
            </div>
          )
        );
      })}
      <Button
        onClick={() => {
          table.setColumnOrder([...(checkableRows ? [selectId] : []), ...(expandableRows ? [expanderId] : []), ...columns.map((column) => column.label)]);
          if (viewId != null) {
            localStorage.removeItem(viewId + orderingStorageKey);
          }
        }}
      >
        Reset ordering
      </Button>
    </div>
  );
};
