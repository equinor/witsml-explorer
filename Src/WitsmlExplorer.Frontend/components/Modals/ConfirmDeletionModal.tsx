import {
  Autocomplete,
  Progress,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import ModalDialog, { ModalContentLayout, ModalWidth } from "components/Modals/ModalDialog";
import { validText } from "components/Modals/ModalParts";
import { Button } from "components/StyledComponents/Button";
import { Checkbox } from "components/StyledComponents/Checkbox";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { Server } from "models/server";
import React, { ChangeEvent, useEffect, useState } from "react";

import styled from "styled-components";
import ConfirmModal from "./ConfirmModal";
import WarningBar from "components/WarningBar";
import { WellContextMenuProps } from "components/ContextMenus/WellContextMenu";

export interface ConfirmDeletionModalProps {
  errorMessage?: string;
  confirmText?: string;
  onSubmit: (cascadedDelete: boolean) => void;
}

const ConfirmDeletionModal = (
  props: ConfirmDeletionModalProps
): React.ReactElement => {
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();


  const [cascadeDelete, setCascadeDelete] = useState<boolean>(false);

  const name = "name";
  const uid = "uid";

 

  return (
    <ConfirmModal
      heading={"Delete well?"}
      content={
        <>
        <ModalContentLayout>
          <span>
            This will permanently delete <strong>{name}</strong> with uid:{" "}
            <strong>{uid}</strong>
          </span>

          <Checkbox
            label={`Delete cascade?`}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setCascadeDelete(e.target.checked);
            }}
            colors={colors}
          />

          {cascadeDelete && (
            <WarningBar
              message={"This will also delete all objects under well " + name}
            />
          )}
          </ModalContentLayout>
        </>
      }
      onConfirm={() => props.onSubmit(cascadeDelete)}
      confirmColor={"danger"}
      confirmText={"Delete well"}
      switchButtonPlaces={true}
    />
  );
};

export default ConfirmDeletionModal;
