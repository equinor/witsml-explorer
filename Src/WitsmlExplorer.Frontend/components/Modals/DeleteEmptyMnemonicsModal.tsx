import { TextField } from "@material-ui/core";
import { useContext, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteEmptyMnemonicsJob } from "../../models/jobs/deleteEmptyMnemonicsJob";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import { DateTimeField } from "./DateTimeField";
import ModalDialog from "./ModalDialog";

export interface DeleteEmptyMnemonicsModalProps {
  wells?: Well[];
  wellbores?: Wellbore[];
  dispatchOperation: (action: HideModalAction) => void;
}

const DeleteEmptyMnemonicsModal = (props: DeleteEmptyMnemonicsModalProps): React.ReactElement => {
  const { wells, wellbores, dispatchOperation } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const [nullDepthValue, setNullDepthValue] = useState<number>(-999.25);
  const [nullTimeValue, setNullTimeValue] = useState<string>("1900-01-01T00:00:00.000Z");
  const [nullTimeValueValid, setNullTimeValueValid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (nullDepthValue: number, nullTimeValue: string) => {
    setIsLoading(true);

    const job: DeleteEmptyMnemonicsJob = {
      wells: wells?.map((x) => {
        return { wellUid: x.uid, wellName: x.name };
      }),
      wellbores: wellbores?.map((x) => {
        return { wellboreUid: x.uid, wellboreName: x.name, wellUid: x.wellUid, wellName: x.wellName };
      }),
      nullDepthValue: nullDepthValue,
      nullTimeValue: nullTimeValue
    };

    await JobService.orderJob(JobType.DeleteEmptyMnemonics, job);

    setIsLoading(false);

    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      <ModalDialog
        heading={`Delete empty mnemonics`}
        confirmText={`Submit`}
        content={
          <ContentLayout>
            <DateTimeField
              value={nullTimeValue}
              label="Null time value"
              updateObject={(dateTime: string, valid: boolean) => {
                setNullTimeValue(dateTime);
                setNullTimeValueValid(valid);
              }}
              timeZone={timeZone}
              dateTimeFormat={dateTimeFormat}
            />
            <TextField label="Null depth value" type="number" fullWidth value={nullDepthValue} onChange={(e: any) => setNullDepthValue(+e.target.value)} />
          </ContentLayout>
        }
        confirmDisabled={!nullTimeValueValid}
        onSubmit={() => onSubmit(nullDepthValue, nullTimeValue)}
        isLoading={isLoading}
      />
    </>
  );
};

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export default DeleteEmptyMnemonicsModal;
