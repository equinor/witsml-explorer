import { createGlobalStyle } from "styled-components";
import { AssetsLoader } from "./AssetsLoader";
import { colors } from "../styles/Colors";

const GlobalStyles = createGlobalStyle`
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
    width: 6px;
    height: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${colors.interactive.disabledBorder};
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  body {
    font-family: EquinorRegular, sans-serif;
    background: #FFFFFF;
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

  //over riding  input numbers padding from mterial ui
  .MuiFormControlLabel-label {
    font-size: 0.9rem !important;
    font-family: EquinorMedium  !important;
  }

  .MuiInputBase-input.MuiInput-input {
    padding-bottom:0px;
    border-bottom:2px solid #999999;
  }

  //overriding input checkbox default color
  .MuiButtonBase-root.MuiIconButton-root{
    color:#AAAAAA ;
  }

  // overriding treeview hover style from material ui
  .MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label {
    background-color:transparent !important;
  }

  .MuiTreeItem-label:hover{
    background-color:transparent !important;
  }

  .ListWells {
    &:hover{
       background-color:${colors.ui.backgroundLight}
    }
   
  }
  //text field global
  .MuiTextField-root {
    margin:1rem;
`;

export default GlobalStyles;
