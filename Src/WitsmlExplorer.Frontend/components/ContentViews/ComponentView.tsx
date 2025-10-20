import DataSourceConfigurationSetView from "components/ContentViews/DataWorkOrder/DataSourceConfigurationSetView";
import { ReactElement } from "react";
import { useParams } from "react-router-dom";

enum ComponentGroupUrlParams {
  DataSourceConfigurationSet = "DataSourceConfigurationSet"
}

const componentViews: Record<ComponentGroupUrlParams, ReactElement> = {
  [ComponentGroupUrlParams.DataSourceConfigurationSet]: (
    <DataSourceConfigurationSetView />
  )
};

export function ComponentView() {
  const { componentGroup } = useParams();

  const getComponentView = (componentType: string) => {
    const view = componentViews[componentType as ComponentGroupUrlParams];
    if (!view) {
      throw new Error(
        `No component view is implemented for item: ${JSON.stringify(
          componentType
        )}`
      );
    }
    return view;
  };

  return getComponentView(componentGroup);
}
