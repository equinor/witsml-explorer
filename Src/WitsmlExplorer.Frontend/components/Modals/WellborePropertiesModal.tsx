import { TextField } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import MenuItem from "@material-ui/core/MenuItem";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import Wellbore, { wellboreHasChanges } from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import { DateTimeField } from "./DateTimeField";
import ModalDialog from "./ModalDialog";
import { PropertiesModalMode, validText } from "./ModalParts";

export interface WellborePropertiesModalProps {
  mode: PropertiesModalMode;
  wellbore: Wellbore;
  dispatchOperation: (action: HideModalAction) => void;
}

const purposeValues = ["appraisal", "development", "exploration", "fluid storage", "general srvc", "mineral", "unknown"];

const WellborePropertiesModal = (props: WellborePropertiesModalProps): React.ReactElement => {
  const { mode, wellbore, dispatchOperation } = props;
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [editableWellbore, setEditableWellbore] = useState<Wellbore>(null);
  const [pristineWellbore, setPristineWellbore] = useState<Wellbore>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dTimeKickoffValid, setDTimeKickoffValid] = useState<boolean>(true);
  const editMode = mode === PropertiesModalMode.Edit;

  const onSubmit = async (updatedWellbore: Wellbore) => {
    setIsLoading(true);
    const wellboreJob = {
      wellbore: updatedWellbore
    };
    await JobService.orderJob(mode == PropertiesModalMode.New ? JobType.CreateWellbore : JobType.ModifyWellbore, wellboreJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const onChangePurpose = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setEditableWellbore({ ...editableWellbore, wellborePurpose: e.target.value });
  };

  useEffect(() => {
    setEditableWellbore(wellbore);
    setPristineWellbore(wellbore);
  }, [wellbore]);

  return (
    <>
      {editableWellbore && (
        <ModalDialog
          heading={mode == PropertiesModalMode.New ? `New Wellbore` : `Edit properties for ${editableWellbore.name}`}
          content={
            <>
              <TextField
                id={"uid"}
                label={"uid"}
                value={editableWellbore.uid}
                fullWidth
                disabled={editMode}
                required
                error={!validText(editableWellbore.uid)}
                helperText={editableWellbore.uid.length === 0 ? "A wellbore uid must be 1-64 characters" : ""}
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableWellbore({ ...editableWellbore, uid: e.target.value })}
              />
              <TextField
                id={"name"}
                label={"wellbore name"}
                value={editableWellbore.name}
                error={!validText(editableWellbore.name)}
                helperText={editableWellbore.name.length === 0 ? "A wellbore name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableWellbore({ ...editableWellbore, name: e.target.value })}
              />
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableWellbore.wellUid} fullWidth />
              <TextField disabled id="wellName" label="well name" defaultValue={editableWellbore.wellName} fullWidth />
              <TextField disabled id={"wellboreParent"} label={"wellbore parent"} defaultValue={editableWellbore.wellboreParentName} fullWidth />
              <TextField id={"wellborePurpose"} select label={"wellbore purpose"} value={editableWellbore.wellborePurpose || ""} fullWidth onChange={(e) => onChangePurpose(e)}>
                {purposeValues &&
                  purposeValues.map((purposeValue) => (
                    <MenuItem key={purposeValue} value={purposeValue}>
                      {purposeValue}
                    </MenuItem>
                  ))}
              </TextField>
              {mode == PropertiesModalMode.Edit && (
                <>
                  <Container>
                    <TextField
                      id={"number"}
                      label={"number"}
                      value={editableWellbore.number}
                      fullWidth
                      onChange={(e) => setEditableWellbore({ ...editableWellbore, number: e.target.value })}
                    />
                    <TextField
                      id={"suffixAPI"}
                      label={"suffix api"}
                      value={editableWellbore.suffixAPI}
                      fullWidth
                      onChange={(e) => setEditableWellbore({ ...editableWellbore, suffixAPI: e.target.value })}
                    />
                  </Container>
                  <TextField
                    id={"numGovt"}
                    label={"num govt"}
                    value={editableWellbore.numGovt}
                    fullWidth
                    onChange={(e) => setEditableWellbore({ ...editableWellbore, numGovt: e.target.value })}
                  />
                  <DateTimeField
                    value={editableWellbore.dTimeKickoff}
                    label="dTimeKickoff"
                    updateObject={(dateTime: string, valid: boolean) => {
                      setEditableWellbore({ ...editableWellbore, dTimeKickoff: dateTime });
                      setDTimeKickoffValid(valid);
                    }}
                    timeZone={timeZone}
                  />
                  <Container>
                    <TextField
                      id={"md"}
                      label={"md"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{editableWellbore.md ? editableWellbore.md.uom : ""}</InputAdornment>
                      }}
                      disabled={!editableWellbore.md}
                      value={editableWellbore.md?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          md: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableWellbore.md.uom }
                        })
                      }
                    />
                    <TextField
                      id={"tvd"}
                      label={"tvd"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{editableWellbore.tvd ? editableWellbore.tvd.uom : ""}</InputAdornment>
                      }}
                      disabled={!editableWellbore.tvd}
                      value={editableWellbore.tvd?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          tvd: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableWellbore.tvd.uom }
                        })
                      }
                    />
                  </Container>
                  <Container>
                    <TextField
                      id={"mdKickoff"}
                      label={"md kickoff"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{editableWellbore.mdKickoff ? editableWellbore.mdKickoff.uom : ""}</InputAdornment>
                      }}
                      disabled={!editableWellbore.mdKickoff}
                      value={editableWellbore.mdKickoff?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          mdKickoff: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableWellbore.mdKickoff.uom }
                        })
                      }
                    />
                    <TextField
                      id={"tvdKickoff"}
                      label={"tvd kickoff"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{editableWellbore.tvdKickoff ? editableWellbore.tvdKickoff.uom : ""}</InputAdornment>
                      }}
                      disabled={!editableWellbore.tvdKickoff}
                      value={editableWellbore.tvdKickoff?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          tvdKickoff: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableWellbore.tvdKickoff.uom }
                        })
                      }
                    />
                  </Container>
                  <Container>
                    <TextField
                      id={"mdPlanned"}
                      label={"md planned"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{editableWellbore.mdPlanned ? editableWellbore.mdPlanned.uom : ""}</InputAdornment>
                      }}
                      disabled={!editableWellbore.mdPlanned}
                      value={editableWellbore.mdPlanned?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          mdPlanned: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableWellbore.mdPlanned.uom }
                        })
                      }
                    />
                    <TextField
                      id={"tvdPlanned"}
                      label={"tvd planned"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{editableWellbore.tvdPlanned ? editableWellbore.tvdPlanned.uom : ""}</InputAdornment>
                      }}
                      disabled={!editableWellbore.tvdPlanned}
                      value={editableWellbore.tvdPlanned?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          tvdPlanned: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableWellbore.tvdPlanned.uom }
                        })
                      }
                    />
                  </Container>
                  <Container>
                    <TextField
                      id={"mdSubSeaPlanned"}
                      label={"md subsea planned"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{editableWellbore.mdSubSeaPlanned ? editableWellbore.mdSubSeaPlanned.uom : ""}</InputAdornment>
                      }}
                      disabled={!editableWellbore.mdSubSeaPlanned}
                      value={editableWellbore.mdSubSeaPlanned?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          mdSubSeaPlanned: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableWellbore.mdSubSeaPlanned.uom }
                        })
                      }
                    />
                    <TextField
                      id={"tvdSubSeaPlanned"}
                      label={"tvd subsea planned"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{editableWellbore.tvdSubSeaPlanned ? editableWellbore.tvdSubSeaPlanned.uom : ""}</InputAdornment>
                      }}
                      disabled={!editableWellbore.tvdSubSeaPlanned}
                      value={editableWellbore.tvdSubSeaPlanned?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          tvdSubSeaPlanned: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableWellbore.tvdSubSeaPlanned.uom }
                        })
                      }
                    />
                  </Container>
                  <TextField
                    id={"dayTarget"}
                    label={"day target"}
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{editableWellbore.dayTarget ? editableWellbore.dayTarget.uom : ""}</InputAdornment>
                    }}
                    disabled={!editableWellbore.dayTarget}
                    value={editableWellbore.dayTarget?.value}
                    onChange={(e) =>
                      setEditableWellbore({
                        ...editableWellbore,
                        dayTarget: { value: isNaN(parseInt(e.target.value)) ? undefined : parseInt(e.target.value), uom: editableWellbore.dayTarget.uom }
                      })
                    }
                  />
                </>
              )}
            </>
          }
          confirmDisabled={!validText(editableWellbore.uid) || !validText(editableWellbore.name) || !dTimeKickoffValid || !wellboreHasChanges(pristineWellbore, editableWellbore)}
          onSubmit={() => onSubmit(editableWellbore)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

const Container = styled.div`
  display: flex;
`;

export default WellborePropertiesModal;
