import { Typography } from "@equinor/eds-core-react";
import { QueryContext } from "contexts/queryContext";
import { XMLParser } from "fast-xml-parser";
import { FC, useContext } from "react";
import styled from "styled-components";

const ResultMeta: FC = () => {
  const {
    queryState: { queries, tabIndex }
  } = useContext(QueryContext);

  const { result } = queries[tabIndex];

  const responseTime = queries[tabIndex].responseTime;
  const parser = new XMLParser();
  const resultObj = parser.parse(result);
  const templateObject = Object.keys(resultObj)?.[0]?.slice(0, -1);
  const templateObjectUpperCase =
    templateObject !== undefined
      ? templateObject[0].toUpperCase() + templateObject.slice(1)
      : "";
  const resultCount = countItemsAtDepth2(resultObj, templateObject);

  return (
    <Layout>
      {resultCount > 0 && (
        <StyledTypography>{`Executed in: ${responseTime} ms,  ${templateObjectUpperCase}s: ${resultCount}`}</StyledTypography>
      )}
      {resultCount === undefined && (
        <StyledTypography>{`Executed in: ${responseTime} ms`}</StyledTypography>
      )}
    </Layout>
  );
};

const Layout = styled.div`
  padding-left: 46px;
`;

const StyledTypography = styled(Typography)`
  font-size: 0.8rem;
`;

function countItemsAtDepth2(obj: any, templateObject: string) {
  try {
    const depth1object = Object.values(obj)[0] as any;
    const depth2objects = depth1object[templateObject];
    const depth2length = depth2objects.length;
    return depth2length;
  } catch {
    return null;
  }
}

export default ResultMeta;
