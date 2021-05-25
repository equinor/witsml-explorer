import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function CheckIcon(): React.ReactElement {
  return (
    <>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/check.svg"} alt="check" />
    </>
  );
}
