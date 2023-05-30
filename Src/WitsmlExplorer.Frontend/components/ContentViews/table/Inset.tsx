import { Icon } from "@equinor/eds-core-react";
import { IconButton, TableCell as MuiTableCell, TableRow as MuiTableRow } from "@material-ui/core";
import { ReactElement } from "react";
import ContentTable, { TableDataCell, TableHeaderCell } from "./ContentTable";
import { ContentTableColumn } from "./tableParts";

export interface Inset {
  columns: ContentTableColumn[];
  data: { [uid: string]: any[] };
}

export interface InsetHeaderProps {
  inset: Inset;
  openInsets: string[];
  data: any[];
  setOpenInsets: (openInsets: string[]) => void;
}

export const InsetHeader = (props: InsetHeaderProps): ReactElement => {
  const { inset, openInsets, data, setOpenInsets } = props;
  return inset ? (
    <TableHeaderCell>
      <IconButton
        size="small"
        onClick={() => {
          if (openInsets.length > 0) {
            setOpenInsets([]);
          } else {
            setOpenInsets(data.map((item) => item.uid));
          }
        }}
      >
        <Icon name={openInsets.length > 0 ? "chevronUp" : "chevronDown"} />
      </IconButton>
    </TableHeaderCell>
  ) : (
    <></>
  );
};

export interface InsetToggleProps {
  inset: Inset;
  openInsets: string[];
  uid: string;
  setOpenInsets: (openInsets: string[]) => void;
}

export const InsetToggle = (props: InsetToggleProps): ReactElement => {
  const { inset, openInsets, uid, setOpenInsets } = props;
  return inset ? (
    <TableDataCell>
      {inset.data[uid]?.length != 0 && (
        <IconButton
          size="small"
          style={{ paddingLeft: "3px" }}
          onClick={() => {
            const openIndex = openInsets.findIndex((open) => open === uid);
            if (openIndex !== -1) {
              openInsets.splice(openIndex, 1);
              setOpenInsets(openInsets.filter((openInset) => openInset !== uid));
            } else {
              setOpenInsets(openInsets.concat(uid));
            }
          }}
        >
          <Icon name={openInsets.findIndex((open) => open === uid) !== -1 ? "chevronUp" : "chevronDown"} />
        </IconButton>
      )}
    </TableDataCell>
  ) : (
    <></>
  );
};

export interface InsetRowProps {
  inset: Inset;
  openInsets: string[];
  uid: string;
  columnsLength: number;
}

export const InsetRow = (props: InsetRowProps): ReactElement => {
  const { inset, openInsets, uid, columnsLength } = props;
  return inset && inset.data[uid].length != 0 && openInsets.findIndex((open) => open === uid) !== -1 ? (
    <MuiTableRow>
      <MuiTableCell colSpan={1} padding="none"></MuiTableCell>
      <MuiTableCell colSpan={columnsLength} padding="none">
        <div style={{ maxWidth: "400px" }}>
          <ContentTable columns={inset.columns} data={inset.data[uid]} showTotalItems={false} />
        </div>
      </MuiTableCell>
    </MuiTableRow>
  ) : (
    <></>
  );
};
