import { TextField, Typography } from "@equinor/eds-core-react";
import SortableEdsTable, {
  Column
} from "components/ContentViews/table/SortableEdsTable";
import formatDateString from "components/DateFormatter";
import {
  ComparisonCell,
  LabelsLayout,
  StyledTypography,
  TableLayout
} from "components/Modals/ComparisonModalStyles";
import { markDateTimeStringDifferences } from "components/Modals/LogComparisonUtils";
import { displayMissingObjectModal } from "components/Modals/MissingObjectModals";
import ModalDialog, {
  ModalContentLayout,
  ModalWidth
} from "components/Modals/ModalDialog";
import ProgressSpinner from "components/ProgressSpinner";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import MessageObject from "models/messageObject";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import { useEffect, useState } from "react";
import ObjectService from "services/objectService";

export interface MessageComparisonModalProps {
  sourceMessage: MessageObject;
  sourceServer: Server;
  targetServer: Server;
  targetObject: ObjectOnWellbore;
  dispatchOperation: DispatchOperation;
}

const MessageComparisonModal = (
  props: MessageComparisonModalProps
): React.ReactElement => {
  const {
    sourceMessage,
    sourceServer,
    targetServer,
    targetObject,
    dispatchOperation
  } = props;
  const {
    operationState: { timeZone, colors, dateTimeFormat }
  } = useOperationState();
  const [targetMessage, setTargetMessage] = useState<MessageObject>(null);
  const [differenceFound, setDifferenceFound] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchTarget = async () => {
      const target = await ObjectService.getObject(
        targetObject.wellUid,
        targetObject.wellboreUid,
        targetObject.uid,
        ObjectType.Message,
        null,
        targetServer
      );
      if (target == null) {
        dispatchOperation({ type: OperationType.HideModal });
        const failureMessageTarget = `Unable to compare the message as either the message with UID ${targetObject.uid} does not exist on the target server or it was not possible to fetch the message.`;
        displayMissingObjectModal(
          targetServer,
          targetObject.wellUid,
          targetObject.wellboreUid,
          targetObject.uid,
          dispatchOperation,
          failureMessageTarget,
          ObjectType.Message
        );
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
    const sourceDTim = formatDateString(
      sourceMessage.dTim,
      timeZone,
      dateTimeFormat
    );
    const targetDTim = formatDateString(
      targetMessage.dTim,
      timeZone,
      dateTimeFormat
    );
    let areDifferent = sourceDTim != targetDTim;
    const [sourceDTimDiff, targetDTimDiff] = markDateTimeStringDifferences(
      sourceDTim,
      targetDTim
    );
    rows.push({
      element: "dTim",
      source: sourceDTimDiff,
      target: targetDTimDiff,
      elementValue: (
        <ComparisonCell>
          <Typography>
            {sourceDTim != targetDTim ? <mark>dTim</mark> : "dTim"}
          </Typography>
        </ComparisonCell>
      ),
      sourceValue: (
        <ComparisonCell>
          <Typography>{sourceDTimDiff}</Typography>
        </ComparisonCell>
      ),
      targetValue: (
        <ComparisonCell>
          <Typography>{targetDTimDiff}</Typography>
        </ComparisonCell>
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
          <ComparisonCell>
            <Typography>{diff ? <mark>{element}</mark> : element}</Typography>
          </ComparisonCell>
        ),
        sourceValue: <Typography>{source}</Typography>,
        targetValue: <Typography>{target}</Typography>
      });
    };
    pushRow(
      "messageText",
      sourceMessage.messageText,
      targetMessage.messageText
    );
    pushRow("name", sourceMessage.name, targetMessage.name);
    pushRow(
      "typeMessage",
      sourceMessage.typeMessage,
      targetMessage.typeMessage
    );
    pushRow(
      "commonData.sourceName",
      sourceMessage.commonData.sourceName,
      targetMessage.commonData.sourceName
    );
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
                <TextField
                  readOnly
                  id="sourceServer"
                  label="Source Server"
                  defaultValue={sourceServer.name}
                />
                <TextField
                  readOnly
                  id="targetServer"
                  label="Target Server"
                  defaultValue={targetServer.name}
                />
                <TextField
                  readOnly
                  id="sourceWellName"
                  label="Source Well Name"
                  defaultValue={sourceMessage.wellName}
                />
                <TextField
                  readOnly
                  id="targetWellName"
                  label="Target Well Name"
                  defaultValue={targetObject.wellName}
                />
                <TextField
                  readOnly
                  id="sourceWellboreName"
                  label="Source Wellbore Name"
                  defaultValue={sourceMessage.wellboreName}
                />
                <TextField
                  readOnly
                  id="targetWellboreName"
                  label="Target Wellbore Name"
                  defaultValue={targetObject.wellboreName}
                />
                <TextField
                  readOnly
                  id="uid"
                  label="Source Message UID"
                  defaultValue={sourceMessage.uid}
                />
                <TextField
                  readOnly
                  id="uid"
                  label="Target Message UID"
                  defaultValue={targetObject.uid}
                />
              </LabelsLayout>
              <TableLayout>
                <SortableEdsTable
                  columns={columns}
                  data={data}
                  caption={
                    <StyledTypography colors={colors} variant="h5">
                      {differenceFound
                        ? "Listing of message properties with differing elements marked."
                        : "All the shown fields are equal."}
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

export default MessageComparisonModal;
