import { Search } from "@equinor/eds-core-react";
import { Divider } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import Filter, { EMPTY_FILTER } from "../../contexts/filter";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { colors } from "../../styles/Colors";
import Icons from "../../styles/Icons"
import FilterPanel from "./FilterPanel";
import styled, { CSSProp } from "styled-components";


const SearchFilter = (): React.ReactElement => {
    const { navigationState, dispatchNavigation } = useContext(NavigationContext);
    const { selectedFilter } = navigationState;
    const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);
    const [expanded, setExpanded] = useState<boolean>(false);
    const FilterPopup: CSSProp = { zIndex: 10, position: "absolute", width: "inherit", top: "6rem", minWidth: "174px", paddingRight: "0.1em" }
    useEffect(() => {
        setFilter(selectedFilter);
    }, [selectedFilter]);

    return (
        <>
            <SeachLayout>
                <SearchBarContainer>
                    <Search
                        width={10}
                        height={"30px"}
                        id="filter-tree"
                        value={filter.wellName}
                        placeholder="Search Wells"
                        onChange={(event) => dispatchNavigation({ type: NavigationType.SetFilter, payload: { filter: { ...filter, wellName: event.target.value } } })}
                        autoComplete={"off"} />
                </SearchBarContainer>
                <Icons
                    onClick={() => setExpanded(!expanded)}
                    name={expanded ? "activeFilter" : "filter"}
                    color={colors.interactive.primaryResting}
                    size={32}
                    style={{ cursor: "pointer" }}
                />
            </SeachLayout>
            {expanded ? <div style={FilterPopup}>  <FilterPanel /> </div> : <> </>}
            <Divider />
        </>
    );
}
const SeachLayout = styled.div`{
    display: grid;
    grid-template-columns: 1fr 44px;
    padding: 0.6rem 0rem 0.5rem 1rem;
    position :relative;
}`
const SearchBarContainer = styled.div`{
    width:80%;
}`
export default SearchFilter;