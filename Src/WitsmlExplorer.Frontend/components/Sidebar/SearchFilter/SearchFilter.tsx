import { EdsProvider } from "@equinor/eds-core-react";
import {
  inputBaseClasses,
  inputLabelClasses,
  Stack,
  TextField
} from "@mui/material";
import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import OptionsContextMenu, {
  OptionsContextMenuProps
} from "components/ContextMenus/OptionsContextMenu";
import { useConnectedServer } from "contexts/connectedServerContext";
import {
  FilterContext,
  FilterType,
  FilterTypes,
  getFilterTypeInformation,
  isObjectFilterType,
  isWellboreFilterType
} from "contexts/filter";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import React, {
  ChangeEventHandler,
  KeyboardEventHandler,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import { getSearchViewPath } from "routes/utils/pathBuilder";
import styled, { css } from "styled-components";
import { Colors } from "styles/Colors";
import EndAdornment from "./EndAdornment";
import StartAdornment from "./StartAdornment";
import FilterIcon from "./FilterIcon";
import { UserTheme } from "../../../contexts/operationStateReducer.tsx";

const searchOptions = Object.values(FilterTypes);

const SearchFilter = (): ReactElement => {
  const { dispatchOperation } = useOperationState();
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const { connectedServer } = useConnectedServer();
  const selectedOption = selectedFilter?.filterType;
  const {
    operationState: { colors, theme }
  } = useOperationState();

  const isCompact = theme === UserTheme.Compact;
  const iconColor = colors.interactive.primaryResting;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [nameFilter, setNameFilter] = useState<string>(selectedFilter.name);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const dispatch = setTimeout(() => {
      if (
        nameFilter !== selectedFilter.name &&
        !isObjectFilterType(selectedOption)
      ) {
        updateSelectedFilter({ name: nameFilter });
      }
    }, 400);
    return () => clearTimeout(dispatch);
  }, [nameFilter]);

  useEffect(() => {
    if (nameFilter === "") {
      setNameFilter(selectedFilter.name);
    }
  }, [selectedFilter.name]);

  const openSearchView = (option: FilterType) => {
    if (isObjectFilterType(option) || isWellboreFilterType(option)) {
      const searchParams = createSearchParams({
        value: nameFilter
      });
      navigate({
        pathname: getSearchViewPath(connectedServer.url, option),
        search: searchParams.toString()
      });
    }
  };

  const handleOptionChange = async (newValue: FilterType) => {
    updateSelectedFilter({
      name: "",
      filterType: newValue,
      searchResults: []
    });
    setNameFilter("");
  };

  const handleOpenOptions = () => {
    const contextMenuProps: OptionsContextMenuProps = {
      dispatchOperation,
      options: searchOptions,
      onOptionChange: handleOptionChange,
      getOptionInformation: getFilterTypeInformation
    };
    const textFieldRect = textFieldRef.current?.getBoundingClientRect();
    const position = {
      mouseY: textFieldRect?.bottom ?? 0,
      mouseX: textFieldRect?.left ?? 0
    };
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <OptionsContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const handleFilterReset = () => setNameFilter("");
  const handleSearchOpen = () => openSearchView(selectedOption);

  const handleEnterPress: KeyboardEventHandler = ({ key }) =>
    key == "Enter" ? openSearchView(selectedOption) : null;

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = ({
    target
  }) => setNameFilter(target.value ?? "");

  const handleExpandFiltersClick = () => setExpanded(!expanded);

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        p="0.6rem 6px 0.5rem 1rem"
        borderBottom={`2px solid ${colors.interactive.disabledBorder}`}
      >
        <SearchBarContainer>
          <EdsProvider density="compact">
            <SearchField
              fullWidth
              id="searchField"
              ref={textFieldRef}
              value={nameFilter}
              onChange={handleInputChange}
              variant="outlined"
              colors={colors}
              size="small"
              label={`Search ${pluralize(selectedOption)}`}
              onKeyDown={handleEnterPress}
              $isCompact={isCompact}
              InputProps={{
                startAdornment: (
                  <StartAdornment
                    color={iconColor}
                    disabled={!connectedServer}
                    onOpenOptions={handleOpenOptions}
                  />
                ),
                endAdornment: (
                  <EndAdornment
                    color={iconColor}
                    searchActive={!!nameFilter}
                    onResetFilter={handleFilterReset}
                    onOpenSearch={handleSearchOpen}
                  />
                ),
                classes: {
                  adornedStart: "small-padding-left",
                  adornedEnd: "small-padding-right"
                }
              }}
            />
          </EdsProvider>
        </SearchBarContainer>
        <FilterIcon
          color={iconColor}
          expanded={expanded}
          onClick={handleExpandFiltersClick}
        />
      </Stack>
      {expanded ? <FilterIcon.Popup /> : null}
    </>
  );
};

const SearchField = styled(TextField)<{ colors: Colors; $isCompact: boolean }>`
  &&& > div > fieldset {
    border-color: ${({ colors }) => colors.interactive.primaryResting};
  }

  ${({ $isCompact }) =>
    !$isCompact
      ? ""
      : css`
          .${inputLabelClasses.root} {
            font-size: 0.9rem;
          }

          .${inputBaseClasses.input} {
            padding: 8px 0;
            font-size: 0.9rem;
          }
        `}
`;

const SearchBarContainer = styled.div`
  width: 85%;

  .small-padding-left {
    padding-left: 4px;
  }

  .small-padding-right {
    padding-right: 4px;
  }
`;

export default SearchFilter;
