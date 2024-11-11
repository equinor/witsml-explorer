import { Icon, Label, TextField } from "@equinor/eds-core-react";
import { Tooltip } from "@mui/material";
import { Button } from "components/StyledComponents/Button";
import { useOperationState } from "hooks/useOperationState";
import { ChangeEvent, ReactElement, useState } from "react";
import styled from "styled-components";
import { TooltipLayout } from "../StyledComponents/Tooltip";

interface EditNumberProps {
  label: string;
  infoTooltip?: string;
  infoIconColor?: string;
  defaultValue?: number;
  onSubmit: (value: number) => void;
}

const EditNumber = (props: EditNumberProps): ReactElement => {
  const {
    label,
    infoTooltip,
    infoIconColor,
    defaultValue = 0,
    onSubmit
  } = props;
  const {
    operationState: { colors }
  } = useOperationState();
  const [isEdited, setIsEdited] = useState(false);
  const [value, setValue] = useState<string>(String(defaultValue));

  const submitEditNumber = () => {
    setIsEdited(false);
    onSubmit(parseFloat(value) || null);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^\d*\.?\d*$/.test(newValue)) {
      setIsEdited(true);
      setValue(newValue);
    }
  };

  return (
    <EditNumberLayout>
      <StyledLabel label={label} />
      <StyledTextField
        id={label}
        value={value}
        onChange={onInputChange}
        inputIcon={
          infoTooltip ? (
            <Tooltip title={<TooltipLayout>{infoTooltip}</TooltipLayout>}>
              <Icon
                name="infoCircle"
                color={infoIconColor ?? colors.interactive.primaryResting}
                size={18}
              />
            </Tooltip>
          ) : null
        }
      />
      <Button variant={"ghost"} onClick={submitEditNumber} disabled={!isEdited}>
        <Icon name={"arrowForward"} />
      </Button>
    </EditNumberLayout>
  );
};

const EditNumberLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  align-items: center;
`;

const StyledLabel = styled(Label)`
  align-items: center;
  font-style: italic;
`;

const StyledTextField = styled(TextField)`
  div {
    background-color: transparent;
  }
  min-width: 100px;
  max-width: 100px;
`;

export default EditNumber;
