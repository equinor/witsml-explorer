import { Table } from "@tanstack/react-table";
import { selectId } from "./tableParts";

export const ColumnToggle = (props: { table: Table<any>; checkableRows: boolean }): React.ReactElement => {
  const { table } = props;
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
          column.id != selectId && (
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
                      if (index > (props.checkableRows ? 1 : 0)) {
                        order[index] = order[index - 1];
                        order[index - 1] = column.id;
                      }
                      table.setColumnOrder(order);
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
    </div>
  );
};
