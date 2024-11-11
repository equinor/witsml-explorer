import { useOperationState } from "hooks/useOperationState";
import { ReactElement } from "react";
import { createGlobalStyle } from "styled-components";
import { Colors } from "styles/Colors";

export const GlobalStylesWrapper = (): ReactElement => {
  const {
    operationState: { colors }
  } = useOperationState();

  return <GlobalStyles colors={colors} />;
};

const GlobalStyles = createGlobalStyle<{ colors: Colors }>`
*,
*:before,
*:after {
  box-sizing: border-box;
}

:root {
  --navbar-height: 40px;
  --properties-bar-height: 40px;
  --sidebar-min-width: 174px;
}


  ::-webkit-scrollbar {
    background-color: transparent;
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.colors.interactive.disabledBorder};
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-corner{
    background-color:transparent;
  }
  ::placeholder {
  color: ${(props) => props.colors.text.staticIconsDefault} !important;
  }

  body {
    font-family: EquinorRegular, sans-serif;
    background:${(props) => props.colors.ui.backgroundDefault};
    font-size: 16px;
    margin: 0;
  }
  h1 {
    font-size: 3em;
    line-height: 1em;
    margin-top: 2.5em;
    margin-bottom: 2.5em;
  }
  h2 {
    font-size: 2em;
    line-height: 1.25em;
    margin-top: 2.5em;
  }
  h3 {
    font-family: "EquinorBold", Arial, sans-serif;
    font-size: 1.5em;
    line-height: 1em;
    margin-top: 2.5em;
  }
  h4 {
    font-family: "EquinorBold", Arial, sans-serif;
    font-size: 1em;
    line-height: 1.5em;
  }
  p {
    font-size: 1em;
    line-height: 1.5em;
  }
  input {
    font-family: EquinorRegular, sans-serif;
    font-size: 1em;
  }

  .MuiListItem-container {
    .MuiListItemSecondaryAction-root {
      display: none;
    }

    &:hover {
      .MuiListItemSecondaryAction-root {
        display: block;
      }
    }
  }

  .MuiFormControl-root {
    .MuiFormLabel-root {
     color:${(props) => props.colors.text.staticTextLabel}
    }
    .MuiFormLabel-root.Mui-focused {
      color:${(props) => props.colors.text.staticPropertyValue};
    }
    .MuiInput-underline:before {
      border-bottom: 1px solid #9CA6AC;
    }
    .Mui-disabled {
      color: #999999 !important;
    }
    .MuiTypography-colorTextSecondary {
      color:${(props) => props.colors.text.staticIconsDefault};
    }
    .MuiFormHelperText-root {
      color:${(props) => props.colors.text.staticIconsDefault};
    }
  }

  input[type=text],input[type=password],input[type=number],textarea,textarea.MuiInputBase-input {
    color:${(props) => props.colors.text.staticIconsDefault} ;
  }

  input[type=checkbox] + svg {
    fill:${(props) => props.colors.infographic.primaryMossGreen}
  }

  ul[class*="List__StyledList"] {
    background: ${(props) => props.colors.ui.backgroundLight};
    li {
      color: ${(props) => props.colors.text.staticIconsDefault} ;
      background: ${(props) => props.colors.ui.backgroundLight};
    }
    li:hover {
     text-decoration: none;
     background-color: ${(props) =>
       props.colors.interactive.contextMenuItemHover};
    }
  }

  [class*="Typography__StyledTypography"] {
    color:${(props) => props.colors.text.staticIconsDefault};
  }

  @keyframes fadeToNormal {
    from {
      background-color: ${(props) => props.colors.interactive.successResting};
    }
  }

  .fading-row {
    animation: fadeToNormal 3s;
  }
`;

export default GlobalStyles;
