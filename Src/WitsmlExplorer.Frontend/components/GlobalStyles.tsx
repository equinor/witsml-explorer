import { AssetsLoader } from "components/AssetsLoader";
import { createGlobalStyle } from "styled-components";
import { Colors } from "styles/Colors";

const GlobalStyles = createGlobalStyle<{ colors: Colors }>`
  @font-face {
    font-family: "Equinor";
    src: url("${AssetsLoader.getAssetsRoot()}/assets/fonts/Equinor-Regular.woff2");
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: "EquinorRegular";
    src: url("${AssetsLoader.getAssetsRoot()}/assets/fonts/Equinor-Regular.woff2");
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: "EquinorBold";
    src: url("${AssetsLoader.getAssetsRoot()}/assets/fonts/Equinor-Bold.woff2");
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: "EquinorMedium";
    src: url("${AssetsLoader.getAssetsRoot()}/assets/fonts/Equinor-Medium.woff2");
    font-weight: normal;
    font-style: normal;
  }

*,
*:before,
*:after {
  box-sizing: border-box;
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
    height: 100vh;
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

  p[class*="Typography__StyledTypography"] {
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
