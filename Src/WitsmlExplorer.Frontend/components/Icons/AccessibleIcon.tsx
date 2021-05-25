import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function AccessibleIcon(): React.ReactElement {
  return (
    <>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/accessible.svg"} alt="accessible" />
    </>
  );
}
