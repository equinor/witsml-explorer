import styled from "styled-components";
import Icon from "../../styles/Icons";

export const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export const menuItemText = (operation: string, object: string, array: any[] | null) => {
  const operationUpperCase = operation.charAt(0).toUpperCase() + operation.slice(1);
  const objectPlural = object.charAt(object.length - 1) == "y" ? object.slice(0, object.length - 2) + "ies" : object + "s";
  const isPlural = array ? array.length > 1 : false;
  const count = array && array.length > 0 ? ` ${array.length} ` : " ";
  return `${operationUpperCase}${count}${isPlural ? objectPlural : object}`;
};
