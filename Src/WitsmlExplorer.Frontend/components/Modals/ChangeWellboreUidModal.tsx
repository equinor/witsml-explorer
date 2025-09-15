import { TextField } from "@equinor/eds-core-react";
import OperationType from "contexts/operationType";
import { ModalContentLayout } from "../StyledComponents/ModalContentLayout";
import AuthorizationService from "services/authorizationService";
import { useOperationState } from "../../hooks/useOperationState";
import { validText } from "./ModalParts";
import JobService, { JobType } from "../../services/jobService";
import {
  createCopyWellboreWithObjectsJob,
  onClickPaste
} from "../ContextMenus/CopyUtils";
import { Server } from "../../models/server";
import WellboreReference from "models/jobs/wellboreReference";
import WellReference from "models/jobs/wellReference";
import ModalDialog, { ModalWidth } from "./ModalDialog";
import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { MixedObjectsReferences } from "models/selectableObjectOnWellbore";
import { useGetAllObjectsOnWellbore } from "hooks/query/useGetAllObjectsOnWellbore";
import ProgressSpinner from "components/ProgressSpinner";
import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { SubObjectsSelectionModalContentLayout } from "./SubObjectsSelectionModal";
import WarningBar from "components/WarningBar";
import { useGetWellbore } from "hooks/query/useGetWellbore";

export interface ChangeWellboreUidModalProps {
  servers: Server[];
  sourceWellboreWithMixedObjectsReferences: MixedObjectsReferences;
  targetWell: WellReference;
}

const ChangeWellboreUidModal = (
  props: ChangeWellboreUidModalProps
): React.ReactElement => {
  const { dispatchOperation } = useOperationState();

  const [wellboreName, setWellboreName] = useState<string>(
    props.sourceWellboreWithMixedObjectsReferences.wellboreReference
      .wellboreName
  );

  const [wellboreUid, setWellboreUid] = useState<string>(
    props.sourceWellboreWithMixedObjectsReferences.wellboreReference.wellboreUid
  );

  const [debouncedWellboreId, setDebouncedWellboreId] = useState<string>(
    props.sourceWellboreWithMixedObjectsReferences.wellboreReference.wellboreUid
  );

  const { objectsOnWellbore: objectsOnWellbore, isFetching } =
    useGetAllObjectsOnWellbore(
      AuthorizationService.selectedServer,
      props.targetWell.wellUid,
      debouncedWellboreId
    );

  const { wellbore } = useGetWellbore(
    AuthorizationService.selectedServer,
    props.targetWell.wellUid,
    debouncedWellboreId
  );

  const sameObjectsOnWellbore =
    objectsOnWellbore !== undefined
      ? objectsOnWellbore.filter((x) =>
          props.sourceWellboreWithMixedObjectsReferences.selectedObjects.find(
            (y) => y.uid === x.uid && y.objectType === x.objectType
          )
        )
      : null;

  const columns: ContentTableColumn[] = [
    { property: "objectType", label: "Object type", type: ContentType.String },
    { property: "logType", label: "Log type", type: ContentType.String },
    { property: "uid", label: "Uid", type: ContentType.String },
    { property: "name", label: "Name", type: ContentType.String }
  ];

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedWellboreId(wellboreUid);
    }, 1000);
    return () => clearTimeout(delay);
  }, [wellboreUid]);

  const onConfirm = async () => {
    dispatchOperation({ type: OperationType.HideModal });

    const target: WellboreReference = {
      wellUid: props.targetWell.wellUid,
      wellName: props.targetWell.wellName,
      wellboreName: wellboreName,
      wellboreUid: debouncedWellboreId
    };
    const orderCopyJob = () => {
      const copyJob = createCopyWellboreWithObjectsJob(
        props.sourceWellboreWithMixedObjectsReferences,
        target
      );
      JobService.orderJob(JobType.CopyWellboreWithObjects, copyJob);
    };
    onClickPaste(
      props.servers,
      props.sourceWellboreWithMixedObjectsReferences.wellboreReference
        .serverUrl,
      orderCopyJob
    );
  };

  return (
    <ModalDialog
      heading={`Confirm Paste Details`}
      confirmText={`Paste`}
      cancelText={`Cancel`}
      confirmDisabled={
        !validText(wellboreName, 1, 64) ||
        !validText(wellboreUid, 1, 64) ||
        isFetching
      }
      onSubmit={onConfirm}
      switchButtonPlaces={true}
      isLoading={false}
      width={ModalWidth.LARGE}
      content={
        <ModalContentLayout>
          <TextField
            readOnly
            id="server"
            label="Server"
            defaultValue={AuthorizationService.selectedServer?.name}
            tabIndex={-1}
          />

          <TextField
            id={"wellboreUid"}
            label={"Wellbore UID"}
            required
            value={wellboreUid}
            variant={validText(wellboreUid, 1, 64) ? undefined : "error"}
            helperText={
              !validText(wellboreUid, 1, 64)
                ? "The UID must be 1-64 characters"
                : ""
            }
            onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setWellboreUid(e.target.value);
            }}
          />
          <TextField
            id={"wellboreName"}
            label={"Wellbore Name"}
            required
            value={wellboreName}
            variant={validText(wellboreName, 1, 64) ? undefined : "error"}
            helperText={
              !validText(wellboreName, 1, 64)
                ? "The name must be 1-64 characters"
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWellboreName(e.target.value)
            }
          />
          {isFetching && <ProgressSpinner message="Fetching data" />}
          {wellbore !== undefined &&
            objectsOnWellbore === undefined &&
            !isFetching && (
              <SubObjectsSelectionModalContentLayout>
                <WarningBar message="The wellbore exists on the target server, but no objects will be overwritten as all uids differs" />
              </SubObjectsSelectionModalContentLayout>
            )}
          {wellbore !== undefined &&
            objectsOnWellbore !== undefined &&
            objectsOnWellbore.length > 0 &&
            !isFetching && (
              <SubObjectsSelectionModalContentLayout>
                <WarningBar message="Some objects already exist on the target server. Only objects that do not already exist will be copied." />
                <ContentTable
                  viewId="subObjectsListView"
                  columns={columns}
                  data={sameObjectsOnWellbore}
                  disableSearchParamsFilter={true}
                />
              </SubObjectsSelectionModalContentLayout>
            )}
        </ModalContentLayout>
      }
    />
  );
};

export default ChangeWellboreUidModal;
