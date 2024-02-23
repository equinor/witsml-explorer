import styled from "styled-components";

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CommonPanelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  > p {
    margin-left: -1rem;
  }
`;
