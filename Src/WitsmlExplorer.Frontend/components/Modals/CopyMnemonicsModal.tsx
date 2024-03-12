import { Radio } from "@equinor/eds-core-react";
import ModalDialog from "components/Modals/ModalDialog";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useContext, useState } from "react";
import styled from "styled-components";
import ObjectReference from "../../models/jobs/objectReference";
import ComponentReferences, {
  createComponentReferences
} from "../../models/jobs/componentReferences";
import { CopyComponentsJob } from "../../models/jobs/copyJobs";
import JobService, { JobType } from "../../services/jobService";
import { DeleteComponentsJob } from "../../models/jobs/deleteJobs";
import { ReplaceComponentsJob } from "../../models/jobs/replaceComponentsJob";
import { ComponentType, getParentType } from "../../models/componentType";
import ComponentService from "../../services/componentService";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";

enum CopyMnemonicsType {
  DeleteInsert = "deleteInsert",
  Paste = "paste"
}

export interface CopyMnemonicsModalProps {
  sourceReferences: ComponentReferences;
  targetReference: ObjectReference;
  targetServer: Server;
  startIndex?: string;
  endIndex?: string;
}

const CopyMnemonicsModal = (
  props: CopyMnemonicsModalProps
): React.ReactElement => {
  const {
    sourceReferences,
    targetReference,
    targetServer,
    startIndex,
    endIndex
  } = props;

  const { dispatchOperation } = useContext(OperationContext);

  const [selectedCopyMnemonicsType, setCopyMnemonicsType] = useState<string>(
    CopyMnemonicsType.DeleteInsert
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    setIsLoading(true);

    if (selectedCopyMnemonicsType === CopyMnemonicsType.Paste) {
      await orderPasteJob();
    } else if (selectedCopyMnemonicsType === CopyMnemonicsType.DeleteInsert) {
      await orderDeleteInsertJob();
    }

    setIsLoading(false);
  };

  async function orderPasteJob() {
    const jobType =
      startIndex !== undefined ? JobType.CopyLogData : JobType.CopyComponents;

    const copyJob: CopyComponentsJob = {
      source: sourceReferences,
      target: targetReference,
      startIndex: startIndex,
      endIndex: endIndex
    };

    await JobService.orderJob(jobType, copyJob);
  }

  async function orderDeleteInsertJob() {
    const parentUid = targetReference.uid;
    const parentType = getParentType(ComponentType.Mnemonic);

    const targetParent = await ObjectService.getObject(
      targetReference.wellUid,
      targetReference.wellboreUid,
      parentUid,
      parentType,
      undefined,
      targetServer
    );

    const allTargetComponents = await ComponentService.getComponents(
      targetReference.wellUid,
      targetReference.wellboreUid,
      targetReference.uid,
      ComponentType.Mnemonic,
      targetServer
    );

    const deleteJob: DeleteComponentsJob = {
      toDelete: createComponentReferences(
        allTargetComponents.map((component) => component.mnemonic),
        targetParent,
        ComponentType.Mnemonic
      )
    };

    const copyJob: CopyComponentsJob = {
      source: sourceReferences,
      target: targetReference
    };

    const replaceJob: ReplaceComponentsJob = { deleteJob, copyJob };
    await JobService.orderJob(JobType.ReplaceComponents, replaceJob);
  }

  return (
    <>
      <ModalDialog
        heading={`Paste`}
        confirmText={`Submit`}
        content={
          <ContentLayout>
            <TextLayout>Choose paste option:</TextLayout>
            <RadioLayout>
              <RadioItemLayout>
                <div>
                  <Radio
                    checked={
                      selectedCopyMnemonicsType ===
                      CopyMnemonicsType.DeleteInsert
                    }
                    onChange={() =>
                      setCopyMnemonicsType(CopyMnemonicsType.DeleteInsert)
                    }
                  />
                </div>
                <div>
                  <div>Delete/Insert</div>
                  <div>
                    Delete target mnemonics before copying. The mnemonics will
                    become equal on the source and target server afterwards.
                  </div>
                </div>
              </RadioItemLayout>
              <RadioItemLayout>
                <div>
                  <Radio
                    checked={
                      selectedCopyMnemonicsType === CopyMnemonicsType.Paste
                    }
                    onChange={() =>
                      setCopyMnemonicsType(CopyMnemonicsType.Paste)
                    }
                  />
                </div>
                <div>
                  <div>Paste</div>
                  <div>
                    Data on target server will be overwritten by data on the
                    source. Data on target server outside of the
                    startIndex/endIndex will be kept as is.
                  </div>
                </div>
              </RadioItemLayout>
            </RadioLayout>
          </ContentLayout>
        }
        onSubmit={() => onSubmit()}
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

const TextLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
`;

const RadioLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
`;

const RadioItemLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  align-items: center;
`;

export default CopyMnemonicsModal;
