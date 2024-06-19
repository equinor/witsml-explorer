import { Radio, Typography } from "@equinor/eds-core-react";
import ModalDialog from "components/Modals/ModalDialog";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { useState } from "react";
import styled from "styled-components";
import { ComponentType, getParentType } from "../../models/componentType";
import ComponentReferences, {
  createComponentReferences
} from "../../models/jobs/componentReferences";
import { CopyComponentsJob } from "../../models/jobs/copyJobs";
import { DeleteComponentsJob } from "../../models/jobs/deleteJobs";
import ObjectReference from "../../models/jobs/objectReference";
import { ReplaceComponentsJob } from "../../models/jobs/replaceComponentsJob";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import AuthorizationService from "../../services/authorizationService";
import ComponentService from "../../services/componentService";
import JobService, { JobType } from "../../services/jobService";
import ObjectService from "../../services/objectService";

enum CopyMnemonicsType {
  DeleteInsert = "deleteInsert",
  Paste = "paste"
}

export interface CopyMnemonicsModalProps {
  sourceReferences: ComponentReferences;
  targetReference: ObjectReference;
  targetServer: Server;
  sourceServer?: Server;
  startIndex?: string;
  endIndex?: string;
}

const CopyMnemonicsModal = (
  props: CopyMnemonicsModalProps
): React.ReactElement => {
  const {
    sourceReferences,
    targetReference,
    sourceServer,
    targetServer,
    startIndex,
    endIndex
  } = props;

  const { dispatchOperation } = useOperationState();

  const [selectedCopyMnemonicsType, setCopyMnemonicsType] = useState<string>(
    CopyMnemonicsType.Paste
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

    if (sourceServer) {
      AuthorizationService.setSourceServer(sourceServer);
      JobService.orderJobAtServer(jobType, copyJob, targetServer, sourceServer);
    } else {
      await JobService.orderJob(jobType, copyJob);
    }
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

    const indexCurve = (targetParent as LogObject)?.indexCurve;

    const targetComponentsToDelete = allTargetComponents.filter(
      (c) =>
        c.mnemonic !== indexCurve &&
        sourceReferences.componentUids.find((sr) => sr === c.mnemonic)
    );

    if (targetComponentsToDelete.length == 0) {
      await orderPasteJob();
    } else {
      const deleteJob: DeleteComponentsJob = {
        toDelete: createComponentReferences(
          targetComponentsToDelete.map((component) => component.mnemonic),
          targetParent,
          ComponentType.Mnemonic,
          targetServer.url
        )
      };

      const copyJob: CopyComponentsJob = {
        source: sourceReferences,
        target: targetReference
      };

      const replaceJob: ReplaceComponentsJob = { deleteJob, copyJob };

      if (sourceServer) {
        await JobService.orderJobAtServer(
          JobType.ReplaceComponents,
          replaceJob,
          targetServer,
          sourceServer
        );
      } else {
        await JobService.orderJob(JobType.ReplaceComponents, replaceJob);
      }
    }
  }

  return (
    <>
      <ModalDialog
        heading={`Paste`}
        confirmText={`Submit`}
        content={
          <ContentLayout>
            <TextLayout>
              <Typography variant="h4">Choose paste option:</Typography>
            </TextLayout>
            <RadioLayout>
              <RadioItemLayout>
                <div style={{ alignItems: "top" }}>
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
                  <Typography variant="h5">Paste</Typography>
                  <Typography variant="body_long">
                    Data on target server will be overwritten by data on the
                    source. Data on target server outside of the
                    startIndex/endIndex will be kept as is.
                  </Typography>
                </div>
              </RadioItemLayout>
            </RadioLayout>
            <RadioItemLayout>
              <div style={{ alignItems: "top" }}>
                <Radio
                  checked={
                    selectedCopyMnemonicsType === CopyMnemonicsType.DeleteInsert
                  }
                  onChange={() =>
                    setCopyMnemonicsType(CopyMnemonicsType.DeleteInsert)
                  }
                />
              </div>
              <div>
                <Typography variant="h5">Delete/Insert</Typography>
                <Typography variant="body_long">
                  Delete target mnemonics before copying. The mnemonics will
                  become equal on the source and target server afterwards.
                </Typography>
              </div>
            </RadioItemLayout>
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
  gap: 0.75rem;
`;

const TextLayout = styled.div`
  display: flex;
  flex-direction: row;
`;

const RadioLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
`;

const RadioItemLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  align-items: center;
`;

export default CopyMnemonicsModal;
