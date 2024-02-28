import { Button, Icon, TextField } from "@equinor/eds-core-react";
import React, { ChangeEvent, useContext, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import { MousePosition } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import LogCurvePriorityService from "../../services/logCurvePriorityService";
import { ContentTable, ContentType } from "../ContentViews/table";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "../ContextMenus/ContextMenu";
import { LogCurvePriorityContextMenu } from "../ContextMenus/LogCurvePriorityContextMenu";
import ModalDialog from "./ModalDialog";

export interface LogCurvePriorityModalProps {
  wellUid: string;
  wellboreUid: string;
  prioritizedCurves: string[];
  setPrioritizedCurves: (prioritizedCurves: string[]) => void;
}

export interface LogCurvePriorityRow {
  id: string;
  mnemonic: string;
}

export const LogCurvePriorityModal = (
  props: LogCurvePriorityModalProps
): React.ReactElement => {
  const { wellUid, wellboreUid, prioritizedCurves, setPrioritizedCurves } =
    props;
  const [updatedPrioritizedCurves, setUpdatedPrioritizedCurves] =
    useState<string[]>(prioritizedCurves);
  const [newCurve, setNewCurve] = useState<string>("");
  const { dispatchOperation } = useContext(OperationContext);
  const [position, setPosition] = useState<MousePosition>({
    mouseX: null,
    mouseY: null
  });
  const [checkedCurves, setCheckedCurves] = useState<string[]>([]);

  const columns = [
    {
      property: "mnemonic",
      label: "mnemonic",
      type: ContentType.String,
      width: 500
    }
  ];

  const getTableData = (): LogCurvePriorityRow[] => {
    return updatedPrioritizedCurves.sort().map((mnemonic) => {
      return {
        id: mnemonic,
        mnemonic: mnemonic
      };
    });
  };

  const onDelete = (curvesToDelete: string[]) => {
    setUpdatedPrioritizedCurves(
      updatedPrioritizedCurves.filter((c) => !curvesToDelete.includes(c))
    );
  };

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedCurveRows: LogCurvePriorityRow[]
  ) => {
    preventContextMenuPropagation(event);
    const position = getContextMenuPosition(event);
    setCheckedCurves(checkedCurveRows.map((row) => row.mnemonic));
    setPosition(position);
  };

  const onSubmit = async () => {
    await LogCurvePriorityService.setPrioritizedCurves(
      wellUid,
      wellboreUid,
      updatedPrioritizedCurves
    );
    dispatchOperation({ type: OperationType.HideModal });
    setPrioritizedCurves(updatedPrioritizedCurves);
  };

  const addCurve = () => {
    setUpdatedPrioritizedCurves([...updatedPrioritizedCurves, newCurve]);
    setNewCurve("");
  };

  return (
    <ModalDialog
      heading={`Log Curve Priority`}
      content={
        <>
          <Layout>
            <AddItemLayout>
              <TextField
                id={"addPrioritizedCurve"}
                label="Add prioritized curve"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewCurve(e.target.value)
                }
                value={newCurve}
              />
              <Button
                variant="contained_icon"
                onClick={addCurve}
                disabled={
                  newCurve === "" || updatedPrioritizedCurves.includes(newCurve)
                }
              >
                <Icon name="add" />
              </Button>
            </AddItemLayout>
            <ContentTable
              columns={columns}
              data={getTableData()}
              downloadToCsvFileName={`LogCurvePriority-${wellUid}-${wellboreUid}`}
              onContextMenu={onContextMenu}
              checkableRows
            />
          </Layout>
          <LogCurvePriorityContextMenu
            position={position}
            onDelete={() => onDelete(checkedCurves)}
            onClose={() => setPosition({ mouseX: null, mouseY: null })}
            open={position.mouseY !== null}
          />
        </>
      }
      onSubmit={onSubmit}
      isLoading={false}
      confirmText={"Save"}
    />
  );
};

const Layout = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  max-height: 100%;
  gap: 20px;
`;

const AddItemLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.2fr;
  gap: 10px;
  align-items: end;
`;
