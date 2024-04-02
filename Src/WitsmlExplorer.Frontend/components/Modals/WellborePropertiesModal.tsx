import { Autocomplete } from "@equinor/eds-core-react";
import { TextField } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import formatDateString from "components/DateFormatter";
import { DateTimeField } from "components/Modals/DateTimeField";
import ModalDialog from "components/Modals/ModalDialog";
import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import { invalidStringInput } from "components/Modals/PropertiesModalUtils";
import OperationContext from "contexts/operationContext";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import MaxLength from "models/maxLength";
import Wellbore, { wellboreHasChanges } from "models/wellbore";
import React, { useContext, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";

export interface WellborePropertiesModalProps {
  mode: PropertiesModalMode;
  wellbore: Wellbore;
  dispatchOperation: (action: HideModalAction) => void;
}

const purposeValues = [
  "appraisal",
  "development",
  "exploration",
  "fluid storage",
  "general srvc",
  "mineral",
  "unknown"
];

const WellborePropertiesModal = (
  props: WellborePropertiesModalProps
): React.ReactElement => {
  const { mode, wellbore, dispatchOperation } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
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
    await JobService.orderJob(
      mode == PropertiesModalMode.New
        ? JobType.CreateWellbore
        : JobType.ModifyWellbore,
      wellboreJob
    );
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  useEffect(() => {
    setEditableWellbore({
      ...wellbore,
      dTimeKickoff: formatDateString(
        wellbore.dTimeKickoff,
        timeZone,
        dateTimeFormat
      )
    });
    setPristineWellbore(wellbore);
  }, [wellbore]);

  return (
    <>
      {editableWellbore && (
        <ModalDialog
          heading={
            mode == PropertiesModalMode.New
              ? `New Wellbore`
              : `Edit properties for ${editableWellbore.name}`
          }
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
                helperText={
                  editableWellbore.uid.length === 0
                    ? "A wellbore uid must be 1-64 characters"
                    : ""
                }
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableWellbore({
                    ...editableWellbore,
                    uid: e.target.value
                  })
                }
              />
              <TextField
                id={"name"}
                label={"wellbore name"}
                value={editableWellbore.name}
                error={!validText(editableWellbore.name)}
                helperText={
                  editableWellbore.name.length === 0
                    ? "A wellbore name must be 1-64 characters"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableWellbore({
                    ...editableWellbore,
                    name: e.target.value
                  })
                }
              />
              <TextField
                disabled
                id="wellUid"
                label="well uid"
                defaultValue={editableWellbore.wellUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableWellbore.wellName}
                fullWidth
              />
              <TextField
                disabled
                id={"wellboreParent"}
                label={"wellbore parent"}
                defaultValue={editableWellbore.wellboreParentName}
                fullWidth
              />
              <Autocomplete
                id="wellborePurpose"
                label="wellbore purpose"
                options={purposeValues}
                initialSelectedOptions={[editableWellbore.wellborePurpose]}
                hideClearButton
                onOptionsChange={({ selectedItems }) => {
                  setEditableWellbore({
                    ...editableWellbore,
                    wellborePurpose: selectedItems[0]
                  });
                }}
              />
              {mode == PropertiesModalMode.Edit && (
                <>
                  <Container>
                    <TextField
                      id={"number"}
                      label={"number"}
                      value={editableWellbore.number || ""}
                      fullWidth
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          number: e.target.value
                        })
                      }
                    />
                    <TextField
                      id={"suffixAPI"}
                      label={"suffix api"}
                      value={editableWellbore.suffixAPI || ""}
                      fullWidth
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          suffixAPI: e.target.value
                        })
                      }
                    />
                  </Container>
                  <TextField
                    id={"numGovt"}
                    label={"num govt"}
                    value={editableWellbore.numGovt || ""}
                    fullWidth
                    onChange={(e) =>
                      setEditableWellbore({
                        ...editableWellbore,
                        numGovt: e.target.value
                      })
                    }
                  />
                  <DateTimeField
                    value={editableWellbore.dTimeKickoff || ""}
                    label="dTimeKickoff"
                    updateObject={(dateTime: string, valid: boolean) => {
                      setEditableWellbore({
                        ...editableWellbore,
                        dTimeKickoff: dateTime
                      });
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
                        startAdornment: (
                          <InputAdornment position="start">
                            {editableWellbore.md ? editableWellbore.md.uom : ""}
                          </InputAdornment>
                        )
                      }}
                      disabled={!editableWellbore.md}
                      value={editableWellbore.md?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          md: {
                            value: isNaN(parseFloat(e.target.value))
                              ? undefined
                              : parseFloat(e.target.value),
                            uom: editableWellbore.md.uom
                          }
                        })
                      }
                    />
                    <TextField
                      id={"tvd"}
                      label={"tvd"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {editableWellbore.tvd
                              ? editableWellbore.tvd.uom
                              : ""}
                          </InputAdornment>
                        )
                      }}
                      disabled={!editableWellbore.tvd}
                      value={editableWellbore.tvd?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          tvd: {
                            value: isNaN(parseFloat(e.target.value))
                              ? undefined
                              : parseFloat(e.target.value),
                            uom: editableWellbore.tvd.uom
                          }
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
                        startAdornment: (
                          <InputAdornment position="start">
                            {editableWellbore.mdKickoff
                              ? editableWellbore.mdKickoff.uom
                              : ""}
                          </InputAdornment>
                        )
                      }}
                      disabled={!editableWellbore.mdKickoff}
                      value={editableWellbore.mdKickoff?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          mdKickoff: {
                            value: isNaN(parseFloat(e.target.value))
                              ? undefined
                              : parseFloat(e.target.value),
                            uom: editableWellbore.mdKickoff.uom
                          }
                        })
                      }
                    />
                    <TextField
                      id={"tvdKickoff"}
                      label={"tvd kickoff"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {editableWellbore.tvdKickoff
                              ? editableWellbore.tvdKickoff.uom
                              : ""}
                          </InputAdornment>
                        )
                      }}
                      disabled={!editableWellbore.tvdKickoff}
                      value={editableWellbore.tvdKickoff?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          tvdKickoff: {
                            value: isNaN(parseFloat(e.target.value))
                              ? undefined
                              : parseFloat(e.target.value),
                            uom: editableWellbore.tvdKickoff.uom
                          }
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
                        startAdornment: (
                          <InputAdornment position="start">
                            {editableWellbore.mdPlanned
                              ? editableWellbore.mdPlanned.uom
                              : ""}
                          </InputAdornment>
                        )
                      }}
                      disabled={!editableWellbore.mdPlanned}
                      value={editableWellbore.mdPlanned?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          mdPlanned: {
                            value: isNaN(parseFloat(e.target.value))
                              ? undefined
                              : parseFloat(e.target.value),
                            uom: editableWellbore.mdPlanned.uom
                          }
                        })
                      }
                    />
                    <TextField
                      id={"tvdPlanned"}
                      label={"tvd planned"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {editableWellbore.tvdPlanned
                              ? editableWellbore.tvdPlanned.uom
                              : ""}
                          </InputAdornment>
                        )
                      }}
                      disabled={!editableWellbore.tvdPlanned}
                      value={editableWellbore.tvdPlanned?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          tvdPlanned: {
                            value: isNaN(parseFloat(e.target.value))
                              ? undefined
                              : parseFloat(e.target.value),
                            uom: editableWellbore.tvdPlanned.uom
                          }
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
                        startAdornment: (
                          <InputAdornment position="start">
                            {editableWellbore.mdSubSeaPlanned
                              ? editableWellbore.mdSubSeaPlanned.uom
                              : ""}
                          </InputAdornment>
                        )
                      }}
                      disabled={!editableWellbore.mdSubSeaPlanned}
                      value={editableWellbore.mdSubSeaPlanned?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          mdSubSeaPlanned: {
                            value: isNaN(parseFloat(e.target.value))
                              ? undefined
                              : parseFloat(e.target.value),
                            uom: editableWellbore.mdSubSeaPlanned.uom
                          }
                        })
                      }
                    />
                    <TextField
                      id={"tvdSubSeaPlanned"}
                      label={"tvd subsea planned"}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {editableWellbore.tvdSubSeaPlanned
                              ? editableWellbore.tvdSubSeaPlanned.uom
                              : ""}
                          </InputAdornment>
                        )
                      }}
                      disabled={!editableWellbore.tvdSubSeaPlanned}
                      value={editableWellbore.tvdSubSeaPlanned?.value}
                      onChange={(e) =>
                        setEditableWellbore({
                          ...editableWellbore,
                          tvdSubSeaPlanned: {
                            value: isNaN(parseFloat(e.target.value))
                              ? undefined
                              : parseFloat(e.target.value),
                            uom: editableWellbore.tvdSubSeaPlanned.uom
                          }
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
                      startAdornment: (
                        <InputAdornment position="start">
                          {editableWellbore.dayTarget
                            ? editableWellbore.dayTarget.uom
                            : ""}
                        </InputAdornment>
                      )
                    }}
                    disabled={!editableWellbore.dayTarget}
                    value={editableWellbore.dayTarget?.value}
                    onChange={(e) =>
                      setEditableWellbore({
                        ...editableWellbore,
                        dayTarget: {
                          value: isNaN(parseInt(e.target.value))
                            ? undefined
                            : parseInt(e.target.value),
                          uom: editableWellbore.dayTarget.uom
                        }
                      })
                    }
                  />
                  <TextField
                    disabled
                    id="dTimCreation"
                    label="commonData.dTimCreation"
                    defaultValue={formatDateString(
                      wellbore.dateTimeCreation,
                      timeZone,
                      dateTimeFormat
                    )}
                    fullWidth
                  />
                  <TextField
                    disabled
                    id="dTimLastChange"
                    label="commonData.dTimLastChange"
                    defaultValue={formatDateString(
                      wellbore.dateTimeLastChange,
                      timeZone,
                      dateTimeFormat
                    )}
                    fullWidth
                  />
                  <TextField
                    id="comments"
                    label="comments"
                    multiline
                    error={invalidStringInput(
                      wellbore.comments,
                      editableWellbore.comments,
                      MaxLength.Comment
                    )}
                    helperText={
                      invalidStringInput(
                        wellbore.comments,
                        editableWellbore.comments,
                        MaxLength.Comment
                      )
                        ? `A comment must be 1-${MaxLength.Comment} characters`
                        : ""
                    }
                    inputProps={{ maxLength: MaxLength.Comment }}
                    value={editableWellbore.comments || ""}
                    fullWidth
                    onChange={(e) => {
                      setEditableWellbore({
                        ...editableWellbore,
                        comments: e.target.value
                      });
                    }}
                  />
                </>
              )}
            </>
          }
          confirmDisabled={
            !validText(editableWellbore.uid) ||
            !validText(editableWellbore.name) ||
            !dTimeKickoffValid ||
            !wellboreHasChanges(pristineWellbore, editableWellbore)
          }
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
