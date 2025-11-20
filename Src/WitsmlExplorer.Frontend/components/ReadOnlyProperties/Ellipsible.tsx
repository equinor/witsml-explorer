import { CSSProperties, FC } from "react";
import styled from "styled-components";
import { Tooltip as EdsTooltip, Typography } from "@equinor/eds-core-react";

export interface EllipsibleProps {
  children: string;
  tooltip?: string;
  style?: CSSProperties;
}

const Ellipsible: FC<EllipsibleProps> = ({ children, tooltip, style }) => {
  const text = <Text style={style}>{children}</Text>;

  return (
    <Flex style={style}>
      <FlexItem>
        {tooltip ? <Tooltip title={tooltip ?? ""}>{text}</Tooltip> : text}
      </FlexItem>
    </Flex>
  );
};

export default Ellipsible;

const Tooltip = styled(EdsTooltip)`
  white-space: pre-wrap;
  max-width: 30rem;
  width: auto;
`;

const Text = styled(Typography)`
  overflow: hidden;
  white-space: no-wrap;
  text-overflow: ellipsis;
`;

const FlexItem = styled.div`
  min-width: 0;
`;

const Flex = styled.div`
  display: flex;
  width: 100%;
`;
