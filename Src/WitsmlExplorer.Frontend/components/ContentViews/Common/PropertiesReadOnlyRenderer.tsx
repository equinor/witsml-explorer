import { Label } from "@equinor/eds-core-react";
import { getNestedValue } from "components/Modals/PropertiesModal/NestedPropertyHelpers";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { ReactElement } from "react";

interface PropertiesReadOnlyRendererProps<T> {
  properties: PropertiesReadOnlyProperty[];
  object: T;
}

interface CommonReadOnlyProps {
  property: string;
  propertyType: PropertyType;
}

export type PropertiesReadOnlyProperty = CommonReadOnlyProps;

export const PropertiesReadOnlyRenderer = <T,>({
  properties,
  object
}: PropertiesReadOnlyRendererProps<T>): ReactElement => {
  return (
    <>
      {properties.map((prop) => {
        switch (prop.propertyType) {
          case PropertyType.String:
          case PropertyType.StringNumber:
          case PropertyType.Number:
          case PropertyType.DateTime:
            return (
              <>
                <Label label={prop.property} />
                <Label label={getNestedValue(object, prop.property)} />
              </>
            );
        }
      })}
    </>
  );
};
