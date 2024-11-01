import { Accordion, TextField, Typography } from "@equinor/eds-core-react";
import { StyledAccordionHeader } from "components/Modals/LogComparisonModal";
import ModalDialog, { ModalWidth } from "components/Modals/ModalDialog";
import { validText } from "components/Modals/ModalParts";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import SpliceLogsJob from "models/jobs/spliceLogsJob";
import LogObject from "models/logObject";
import ObjectOnWellbore, { toObjectReferences } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import {
  ChangeEvent,
  DragEvent,
  ReactElement,
  useEffect,
  useState
} from "react";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { Draggable, DummyDrop } from "../StyledComponents/DragDropTable";
import StyledAccordion from "../StyledComponents/StyledAccordion";

const lastId = "dummyLastId";

export interface SpliceLogsProps {
  checkedLogs: ObjectOnWellbore[];
}

const SpliceLogsModal = (props: SpliceLogsProps): ReactElement => {
  const { checkedLogs } = props;
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();
  const [draggedId, setDraggedId] = useState(null);
  const [draggedOverId, setDraggedOverId] = useState(null);
  const [orderedLogs, setOrderedLogs] = useState<LogObject[]>([]);
  const [newLogName, setNewLogName] = useState<string>("Spliced Log");

  useEffect(() => {
    setOrderedLogs([...checkedLogs]);
  }, [checkedLogs]);

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const spliceLogsJob: SpliceLogsJob = {
      logs: toObjectReferences(orderedLogs, ObjectType.Log),
      newLogName,
      newLogUid: uuid()
    };
    await JobService.orderJob(JobType.SpliceLogs, spliceLogsJob);
  };

  const drop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (
      draggedId != null &&
      draggedOverId != null &&
      draggedId != draggedOverId
    ) {
      const dragItemIndex = orderedLogs.findIndex(
        (log) => log.uid == draggedId
      );
      const newOrder = [...orderedLogs];
      newOrder.splice(dragItemIndex, 1);
      if (draggedOverId != lastId) {
        const dragOverItemIndex = newOrder.findIndex(
          (log) => log.uid == draggedOverId
        );
        newOrder.splice(dragOverItemIndex, 0, orderedLogs[dragItemIndex]);
      } else {
        newOrder.push(orderedLogs[dragItemIndex]);
      }
      setOrderedLogs(newOrder);
    }
    setDraggedId(null);
    setDraggedOverId(null);
  };

  return (
    <ModalDialog
      heading="Splice logs"
      onSubmit={onSubmit}
      confirmColor={"primary"}
      confirmDisabled={!validText(newLogName, 1, 64)}
      confirmText={`Splice`}
      isLoading={false}
      showCancelButton={true}
      width={ModalWidth.LARGE}
      content={
        <>
          <StyledAccordion>
            <Accordion.Item>
              <StyledAccordionHeader colors={colors}>
                How are the logs spliced?
              </StyledAccordionHeader>
              <Accordion.Panel
                style={{ backgroundColor: colors.ui.backgroundLight }}
              >
                <ExampleSplice />
              </Accordion.Panel>
            </Accordion.Item>
          </StyledAccordion>
          <Typography style={{ marginTop: "16px", marginBottom: "16px" }}>
            Priority:
          </Typography>
          <DragLayout>
            <OrderingLabel>{`\tname`}</OrderingLabel>
            <OrderingLabel>startIndex</OrderingLabel>
            <OrderingLabel>endIndex</OrderingLabel>
            <OrderingLabel>uid</OrderingLabel>
          </DragLayout>
          <DraggableArea>
            {orderedLogs.map((log, index) => (
              <div key={log.uid}>
                <Draggable
                  onDragStart={() => setDraggedId(log.uid)}
                  onDragEnter={() => setDraggedOverId(log.uid)}
                  onDragEnd={drop}
                  draggable
                  isDragged={log.uid == draggedId ? 1 : 0}
                  isDraggedOver={log.uid == draggedOverId ? 1 : 0}
                  draggingStarted={draggedId != null ? 1 : 0}
                  colors={colors}
                >
                  <DraggableItem>
                    <OrderingLabel>{`${index + 1}.\t ${log.name}${
                      log.runNumber ? ` (${log.runNumber})` : ""
                    }`}</OrderingLabel>
                    <OrderingLabel>{log.startIndex}</OrderingLabel>
                    <OrderingLabel>{log.endIndex}</OrderingLabel>
                    <OrderingLabel>{log.uid}</OrderingLabel>
                  </DraggableItem>
                </Draggable>
              </div>
            ))}
            <DummyDrop
              onDragEnter={() => setDraggedOverId(lastId)}
              onDragEnd={drop}
              isDraggedOver={lastId == draggedOverId ? 1 : 0}
              colors={colors}
            >
              <div style={{ visibility: "hidden", height: "15px" }}></div>
            </DummyDrop>
          </DraggableArea>
          <TextField
            id={"name"}
            label={"name of new log"}
            required
            value={newLogName}
            variant={validText(newLogName) ? undefined : "error"}
            helperText={
              !validText(newLogName, 1, 64)
                ? "The name must be 1-64 characters"
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewLogName(e.target.value)
            }
          />
        </>
      }
    />
  );
};

const ExampleSplice = (): ReactElement => {
  return (
    <Typography
      style={{ whiteSpace: "pre-line", fontVariantNumeric: "tabular-nums" }}
    >
      The logs are spliced by only adding the data for subsequent logs that are
      not within the min and max indexes of the previous log.
      <br />
      This process is repeated for each curve using the min/max index of the
      curve, not the start/end index of the log.
      <br />
      <br />
      Log 1: <br />
      Depth | Curve1 | Curve2 <br />
      1 | 1 | 1 <br />
      2 | 1 | - <br />
      <br />
      Log 2: <br />
      Depth | Curve1 | Curve2 <br />
      2 | 2 | 2 <br />
      3 | 2 | 2 <br />
      <br />
      Spliced Log: <br />
      Depth | Curve1 | Curve2 <br />
      1 | 1 | 1 <br />
      2 | 1 | 2 <br />
      3 | 2 | 2 <br />
    </Typography>
  );
};

const DragLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.8fr 0.8fr 1.5fr;
  column-gap: 12px;
  width: 100%;
`;

const DraggableItem = styled(DragLayout)`
  margin-top: auto;
  margin-bottom: auto;
  cursor: grab;
`;

const OrderingLabel = styled(Typography)`
  font-family: EquinorMedium;
  font-size: 1rem;
  white-space: pre;
  overflow: hidden;
`;

const DraggableArea = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
`;

export default SpliceLogsModal;
