import { Search } from "@equinor/eds-core-react";
import { Divider } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import styled, { CSSProp } from "styled-components";
import { FilterContext } from "../../contexts/filter";
import { colors } from "../../styles/Colors";
import Icons from "../../styles/Icons";
import FilterPanel from "./FilterPanel";

const SearchFilter = (): React.ReactElement => {
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [wellNameFilter, setWellNameFilter] = useState<string>(selectedFilter.name);
  const FilterPopup: CSSProp = { zIndex: 10, position: "absolute", width: "inherit", top: "6rem", minWidth: "174px", paddingRight: "0.1em" };

  useEffect(() => {
    const dispatch = setTimeout(() => {
      if (wellNameFilter !== selectedFilter.name) {
        updateSelectedFilter({ name: wellNameFilter });
      }
    }, 400);
    return () => clearTimeout(dispatch);
  }, [wellNameFilter]);

  useEffect(() => {
    if (wellNameFilter === "") {
      setWellNameFilter(selectedFilter.name);
    }
  }, [selectedFilter.name]);

  return (
    <>
      <SearchLayout>
        <SearchBarContainer>
          <Search
            width={10}
            height={"30px"}
            id="filter-tree"
            value={wellNameFilter}
            placeholder="Search Wells"
            onChange={(event) => setWellNameFilter(event.target.value)}
            autoComplete={"off"}
            style={{ userSelect: "none" }}
          />
        </SearchBarContainer>
        <Icons
          onClick={() => setExpanded(!expanded)}
          name={expanded ? "activeFilter" : "filter"}
          color={colors.interactive.primaryResting}
          size={32}
          style={{ cursor: "pointer" }}
        />
      </SearchLayout>
      {expanded ? (
        <div style={FilterPopup}>
          <FilterPanel />
        </div>
      ) : (
        <> </>
      )}
      <Divider key={"divider"} />
    </>
  );
};

const SearchLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 44px;
  padding: 0.6rem 0.375rem 0.5rem 1rem;
  position: relative;
`;

const SearchBarContainer = styled.div`
  width: 80%;
`;
export default SearchFilter;
