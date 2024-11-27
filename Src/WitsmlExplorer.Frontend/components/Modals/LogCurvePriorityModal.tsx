import { Icon, TextField, Tooltip } from "@equinor/eds-core-react";
import { useOperationState } from "hooks/useOperationState";
import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import styled from "styled-components";
import { MousePosition } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import LogCurvePriorityService from "../../services/logCurvePriorityService";
import { ContentTable, ContentType } from "../ContentViews/table";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "../ContextMenus/ContextMenu";
import { Button as MuiButton, Stack, Typography } from "@mui/material";
import { Button } from "../StyledComponents/Button.tsx";
import { LogCurvePriorityContextMenu } from "../ContextMenus/LogCurvePriorityContextMenu";
import ModalDialog from "./ModalDialog";

export interface LogCurvePriorityModalProps {
  wellUid?: string;
  wellboreUid?: string;
  prioritizedCurves: string[];
  setPrioritizedCurves: (prioritizedCurves: string[]) => void;
  isUniversal: boolean;
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
  const { dispatchOperation } = useOperationState();
  const [position, setPosition] = useState<MousePosition>({
    mouseX: null,
    mouseY: null
  });
  const [checkedCurves, setCheckedCurves] = useState<string[]>([]);

  const [uploadedFile, setUploadedFile] = useState<File>(null);
  const columns = [
    {
      property: "mnemonic",
      label: "mnemonic",
      type: ContentType.String,
      width: 440
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
      updatedPrioritizedCurves,
      props.isUniversal,
      wellUid,
      wellboreUid
    );
    dispatchOperation({ type: OperationType.HideModal });
    setPrioritizedCurves(updatedPrioritizedCurves);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files.item(0);
    if (!file) return;
    const text = (await file.text()).replace(/(\r)/gm, "").trim();
    const data = text.split("\n").slice(1);
    const mergedArray = [...data, ...updatedPrioritizedCurves];
    const uniqueArray = mergedArray.filter(
      (value, index, self) => self.indexOf(value) === index && value !== ""
    );
    setUpdatedPrioritizedCurves(uniqueArray);
    setUploadedFile(file);
  };

  const addCurve = () => {
    setUpdatedPrioritizedCurves([...updatedPrioritizedCurves, newCurve]);
    setNewCurve("");
  };

  return (
    <ModalDialog
      heading={
        props.isUniversal
          ? `Log Curve Universal Priority`
          : `Log Curve Local Priority`
      }
      content={
        <>
          <Layout>
            <Stack direction="row" gap="10px" alignItems="end">
              <TextField
                id={"addPrioritizedCurve"}
                label="Add prioritized curve"
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    addCurve();
                  }
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setNewCurve(e.target.value);
                }}
                value={newCurve}
                width="100%"
              />
              <Button
                onClick={addCurve}
                disabled={
                  newCurve === "" || updatedPrioritizedCurves.includes(newCurve)
                }
              >
                <Icon name="add" />
              </Button>
            </Stack>
            <FileContainer>
              <MuiButton
                variant="contained"
                color="primary"
                component="label"
                startIcon={<Icon name="cloudUpload" />}
              >
                <Typography noWrap>Upload CSV File</Typography>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  onChange={handleFileChange}
                />
              </MuiButton>
              <Tooltip placement={"top"} title={uploadedFile?.name ?? ""}>
                <Typography noWrap style={{ maxWidth: "350px" }}>
                  {uploadedFile?.name ?? "No file chosen"}
                </Typography>
              </Tooltip>
            </FileContainer>
            <ContentTable
              columns={columns}
              data={getTableData()}
              downloadToCsvFileName={
                props.isUniversal
                  ? `LogCurvePriority-universal`
                  : `LogCurvePriority-${wellUid}-${wellboreUid}`
              }
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
  gap: 40px;
`;

const FileContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;

  .MuiButton-root {
    min-width: 160px;
  }
`;
