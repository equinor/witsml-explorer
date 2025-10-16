import { ReactElement } from "react";
import styled from "styled-components";
import {
  PropertiesReadOnlyProperty,
  PropertiesReadOnlyRenderer
} from "./PropertiesReadOnlyRenderer";

export interface CommonGridViewProps<T> {
  title: string;
  object: T;
  properties: PropertiesReadOnlyProperty[];
}

/**
 * CommonGridView component
 *
 * It renders a list of properties.
 *
 * @template T - The type of the object whose properties are being rendered.
 *
 * @param {CommonGridViewProps<T>} props - The props for the CommonGridView component.
 * @param {string} props.title - The title of the modal dialog.
 * @param {T} props.object - The object whose properties are to be rendered.
 * @param {PropertiesReadonlyModalProperty<T>[]} props.properties - The list of properties.
 *
 * @returns {ReactElement} A React element representing the properties modal dialog.
 *
 * @remarks
 * - The `onSubmit` callback only receives modified properties.
 * - The modal validates each property before enabling the submit button.
 */

export const CommonGridView = <T,>(
  props: CommonGridViewProps<T>
): ReactElement => {
  const { object, properties } = props;

  return (
    <Layout>
      <PropertiesReadOnlyRenderer properties={properties} object={object} />
    </Layout>
  );
};

const Layout = styled.div`
  margin-top: 12px;
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;
