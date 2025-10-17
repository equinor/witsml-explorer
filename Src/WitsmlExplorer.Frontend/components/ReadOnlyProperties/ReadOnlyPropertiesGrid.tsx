import { ReactElement } from "react";
import styled from "styled-components";
import {
  ReadOnlyPropertiesRenderer,
  ReadOnlyPropertiesRendererProperty
} from "./ReadOnlyPropertiesRenderer";

export interface ReadOnlyPropertiesGridProps<T> {
  object: T;
  properties: ReadOnlyPropertiesRendererProperty[];
  columns?: number;
}

export const ReadOnlyPropertiesGrid = <T,>(
  props: ReadOnlyPropertiesGridProps<T>
): ReactElement => {
  const { object, properties, columns } = props;

  return (
    <Layout columns={columns ?? 4}>
      <ReadOnlyPropertiesRenderer properties={properties} object={object} />
    </Layout>
  );
};

const Layout = styled.div<{ columns: number }>`
  margin-top: 12px;
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, auto);
  gap: 20px;
  justify-content: start;
`;
