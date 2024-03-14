import { ButtonProps, Button as EdsButton } from "@equinor/eds-core-react";
import OperationContext from "contexts/operationContext";
import React, { useContext } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export type Ref = HTMLButtonElement;

export const Button = React.forwardRef<Ref, ButtonProps>((props, ref) => {
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  if (!props.variant || props.variant === "contained") {
    return <EdsButton ref={ref} {...props} />;
  } else if (props.variant === "contained_icon") {
    return <EdsButton ref={ref} {...props} />;
  } else if (props.variant === "outlined") {
    return <OutlinedButton ref={ref} {...props} colors={colors} />;
  } else if (props.variant === "ghost") {
    return <GhostButton ref={ref} {...props} colors={colors} />;
  } else if (props.variant === "ghost_icon") {
    return <GhostIconButton ref={ref} {...props} colors={colors} />;
  } else {
    throw Error(`Button variant ${props.variant} is not supported!`);
  }
});

Button.displayName = "WitsmlExplorerButton";

const GhostButton = styled(EdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

const GhostIconButton = styled(EdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

const OutlinedButton = styled(EdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;
