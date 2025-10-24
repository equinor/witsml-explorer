import styled from "styled-components";

export const VerticalLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const HorizontalLayout = styled.div`
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 1rem;
  width: 100%;
`;
