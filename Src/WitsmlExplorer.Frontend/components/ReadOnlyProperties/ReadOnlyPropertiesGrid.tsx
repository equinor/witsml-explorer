import { ReactElement } from "react";
import styled, { css } from "styled-components";
import {
  ReadOnlyPropertiesRenderer,
  ReadOnlyPropertiesRendererProperty
} from "./ReadOnlyPropertiesRenderer";

export interface ReadOnlyPropertiesGridProps<T> {
  object: T;
  properties: ReadOnlyPropertiesRendererProperty[];
  columns?: number;
  noMargin?: boolean;
}

export const ReadOnlyPropertiesGrid = <T,>(
  props: ReadOnlyPropertiesGridProps<T>
): ReactElement => {
  const { object, properties, columns } = props;

  return (
    <Layout columns={columns ?? 4} noMargin={props.noMargin}>
      <ReadOnlyPropertiesRenderer properties={properties} object={object} />
    </Layout>
  );
};

const Layout = styled.div<{ columns: number; noMargin?: boolean }>`
  ${({ noMargin }) =>
    noMargin
      ? ""
      : css`
          margin-top: 12px;
          margin-bottom: 12px;
        `}
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, auto);
  gap: 20px;
  justify-content: start;
`;
