import { Typography } from "@equinor/eds-core-react";
import React from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import BaseReport from "../../models/reports/BaseReport";
import { ContentTable, ContentTableColumn, ContentType } from "../ContentViews/table";
import ModalDialog, { ModalWidth } from "./ModalDialog";

export interface ReportModal {
  report: BaseReport;
}

const ReportModal = (props: ReportModal): React.ReactElement => {
  const { report } = props;
  const { operationState, dispatchOperation } = React.useContext(OperationContext);
  const { colors } = operationState;

  const columns: ContentTableColumn[] =
    report.reportItems.length == 0
      ? []
      : Object.keys(report.reportItems[0]).map((key) => ({
        property: key,
        label: key,
        type: ContentType.String
      }));

  return (
    <ModalDialog
      width={ModalWidth.LARGE}
      heading={report.title}
      confirmText="Ok"
      showCancelButton={false}
      content={
        <StyledContent>
          {report.summary && <Typography style={{ color: colors.text.staticIconsDefault }}>{report.summary}</Typography>}
          {columns.length > 0 && <ContentTable columns={columns} data={report.reportItems} showPanel={false} />}
        </StyledContent>
      }
      onSubmit={() => dispatchOperation({ type: OperationType.HideModal })}
      isLoading={false}
    />
  );
};

export default ReportModal;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  justify-content: space-between;
  margin: 1em 0.2em 1em 0.2em;
`;
