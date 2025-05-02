import { Button, Icon } from "@equinor/eds-core-react";
import OperationType from "contexts/operationType";
import { ModalContentLayout } from "../StyledComponents/ModalContentLayout";
import WellboreReference from "models/jobs/wellboreReference";
import ModalDialog from "./ModalDialog";
import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { useGetAllObjectsOnWellbore } from "hooks/query/useGetAllObjectsOnWellbore";

import ProgressSpinner from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useState } from "react";
import ObjectOnWellboreForSelection, {
  ObjectsOnWellbore
} from "models/selectableObjectOnWellbore";
import { useOperationState } from "hooks/useOperationState";
import { useQueryClient } from "@tanstack/react-query";
import { refreshAllObjectsOnWellbore } from "hooks/query/queryRefreshHelpers";

export interface SubObjectsSelectionModalProps {
  sourceWellbore: WellboreReference;
}

const SubObjectsSelectionModal = (
  props: SubObjectsSelectionModalProps
): React.ReactElement => {
  const { dispatchOperation } = useOperationState();

  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();

  const { objectsOnWellbore: objectsOnWellbore, isFetching } =
    useGetAllObjectsOnWellbore(
      connectedServer,
      props.sourceWellbore.wellUid,
      props.sourceWellbore.wellboreUid
    );

  const [selectedRows, setSelectedRows] =
    useState<ObjectOnWellboreForSelection[]>();
  const columns: ContentTableColumn[] = [
    { property: "objectType", label: "Object type", type: ContentType.String },
    { property: "logType", label: "Log type", type: ContentType.String },
    { property: "uid", label: "Uid", type: ContentType.String },
    { property: "name", label: "Name", type: ContentType.String }
  ];

  const onConfirm = async () => {
    const objectsToCopy = {
      wellboreReference: props.sourceWellbore,
      selectedObjects: selectedRows
    } as ObjectsOnWellbore;
    await navigator.clipboard.writeText(JSON.stringify(objectsToCopy));
    dispatchOperation({ type: OperationType.HideModal });
  };

  const refreshTable = async () => {
    refreshAllObjectsOnWellbore(queryClient);
  };

  const panelElements = [
    <Button
      variant="ghost_icon"
      key="refreshJobs"
      aria-disabled={isFetching ? true : false}
      aria-label={isFetching ? "loading data" : null}
      onClick={isFetching ? undefined : () => refreshTable()}
      disabled={isFetching}
    >
      <Icon name="refresh" />
    </Button>
  ];

  return (
    <ModalDialog
      heading={`Select subobjects to copy`}
      confirmText={`Copy`}
      cancelText={`Cancel`}
      onSubmit={onConfirm}
      switchButtonPlaces={true}
      isLoading={false}
      confirmDisabled={
        !selectedRows || (selectedRows && selectedRows.length == 0)
      }
      content={
        <ModalContentLayout>
          {isFetching && <ProgressSpinner message="Fetching data" />}
          {objectsOnWellbore !== undefined && (
            <ContentTable
              viewId="subObjectsListView"
              columns={columns}
              data={objectsOnWellbore}
              initiallySelectedRows={selectedRows}
              onRowSelectionChange={(rows) =>
                setSelectedRows(rows as ObjectOnWellboreForSelection[])
              }
              panelElements={panelElements}
              checkableRows
            />
          )}
        </ModalContentLayout>
      }
    />
  );
};

export default SubObjectsSelectionModal;
