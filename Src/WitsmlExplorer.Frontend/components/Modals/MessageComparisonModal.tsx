import { TextField, Typography } from "@equinor/eds-core-react";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import MessageObject from "../../models/messageObject";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import CredentialsService from "../../services/credentialsService";
import MessageObjectService from "../../services/messageObjectService";
import SortableEdsTable, { Column } from "../ContentViews/table/SortableEdsTable";
import { DispatchOperation } from "../ContextMenus/ContextMenuUtils";
import formatDateString from "../DateFormatter";
import { displayMissingObjectModal } from "../Modals/MissingObjectModals";
import ProgressSpinner from "../ProgressSpinner";
import { markDateTimeStringDifferences } from "./LogComparisonUtils";
import ModalDialog, { ModalContentLayout, ModalWidth } from "./ModalDialog";

export interface MessageComparisonModalProps {
  sourceMessage: MessageObject;
  sourceServer: Server;
  targetServer: Server;
  dispatchOperation: DispatchOperation;
}

const MessageComparisonModal = (props: MessageComparisonModalProps): React.ReactElement => {
  const { sourceMessage, sourceServer, targetServer, dispatchOperation } = props;
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [targetMessage, setTargetMessage] = useState<MessageObject>(null);
  const [differenceFound, setDifferenceFound] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchTarget = async () => {
      const wellUid = sourceMessage.wellUid;
      const wellboreUid = sourceMessage.wellboreUid;
      const targetCredentials = CredentialsService.getCredentialsForServer(targetServer);
      const target = await MessageObjectService.getMessageFromServer(wellUid, wellboreUid, sourceMessage.uid, targetCredentials);
      if (target == null) {
        dispatchOperation({ type: OperationType.HideModal });
        const failureMessageTarget = `Unable to compare the message as either the message with UID ${sourceMessage.uid} does not exist on the target server or it was not possible to fetch the message.`;
        displayMissingObjectModal(targetServer, wellUid, wellboreUid, sourceMessage.uid, dispatchOperation, failureMessageTarget, ObjectType.Message);
      } else {
        setTargetMessage(target);
      }
    };
    fetchTarget();
  }, []);

  useEffect(() => {
    if (data !== null || targetMessage == null) {
      return;
    }
    const rows = [];
    const sourceDTim = formatDateString(sourceMessage.dTim, timeZone);
    const targetDTim = formatDateString(targetMessage.dTim, timeZone);
    let areDifferent = sourceDTim != targetDTim;
    const [sourceDTimDiff, targetDTimDiff] = markDateTimeStringDifferences(sourceDTim, targetDTim);
    rows.push({
      element: "dTim",
      source: sourceDTimDiff,
      target: targetDTimDiff,
      elementValue: (
        <TableCell>
          <Typography>{sourceDTim != targetDTim ? <mark>dTim</mark> : "dTim"}</Typography>
        </TableCell>
      ),
      sourceValue: (
        <TableCell>
          <Typography>{sourceDTimDiff}</Typography>
        </TableCell>
      ),
      targetValue: (
        <TableCell>
          <Typography>{targetDTimDiff}</Typography>
        </TableCell>
      )
    });
    const pushRow = (element: string, source: string, target: string) => {
      const diff = source != target;
      areDifferent = areDifferent || diff;
      rows.push({
        element,
        source,
        target,
        elementValue: (
          <TableCell>
            <Typography>{diff ? <mark>{element}</mark> : element}</Typography>
          </TableCell>
        ),
        sourceValue: <Typography>{source}</Typography>,
        targetValue: <Typography>{target}</Typography>
      });
    };
    pushRow("messageText", sourceMessage.messageText, targetMessage.messageText);
    pushRow("name", sourceMessage.name, targetMessage.name);
    pushRow("typeMessage", sourceMessage.typeMessage, targetMessage.typeMessage);
    pushRow("commonData.sourceName", sourceMessage.commonData.sourceName, targetMessage.commonData.sourceName);
    setData(rows);
    setDifferenceFound(areDifferent);
  }, [targetMessage]);

  return (
    <ModalDialog
      heading={`Message comparison`}
      onSubmit={() => dispatchOperation({ type: OperationType.HideModal })}
      confirmColor={"primary"}
      confirmText={`OK`}
      showCancelButton={false}
      width={ModalWidth.LARGE}
      isLoading={false}
      content={
        <ModalContentLayout>
          {(data && (
            <>
              <LabelsLayout>
                <TextField readOnly id="wellName" label="Well Name" defaultValue={sourceMessage.wellName} />
                <TextField readOnly id="sourceServer" label="Source Server" defaultValue={sourceServer.name} />
                <TextField readOnly id="wellboreName" label="Wellbore Name" defaultValue={sourceMessage.wellboreName} />
                <TextField readOnly id="targetServer" label="Target Server" defaultValue={targetServer.name} />
                <TextField readOnly id="uid" label="Message UID" defaultValue={sourceMessage.uid} />
              </LabelsLayout>
              <TableLayout>
                <SortableEdsTable
                  columns={columns}
                  data={data}
                  caption={
                    <StyledTypography variant="h5">
                      {differenceFound ? "Listing of message properties with differing elements marked." : "All the shown fields are equal."}
                    </StyledTypography>
                  }
                />
              </TableLayout>
            </>
          )) || <ProgressSpinner message="Fetching target message." />}
        </ModalContentLayout>
      }
    />
  );
};

const columns: Column[] = [
  { name: "Element", accessor: "element", sortDirection: "ascending" },
  { name: "Source message", accessor: "source" },
  { name: "Target message", accessor: "target" }
];

const LabelsLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 0.8rem;
`;

const TableCell = styled.div`
  font-feature-settings: "tnum";
  mark {
    background: #e6faec;
    background-blend-mode: darken;
    font-weight: 600;
  }
`;

const TableLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTypography = styled(Typography)`
  padding: 1rem 0 1rem 0;
`;
export default MessageComparisonModal;
