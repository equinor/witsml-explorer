import { ViewNotFound } from "components/ContentViews/ViewNotFound";
import { ComponentType } from "models/componentType";
import { ObjectType } from "models/objectType";
import { Outlet, useParams } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";

const validators: Record<string, (value: string) => boolean> = {
  objectGroup: (value: string) =>
    Object.values(ObjectType).includes(value as ObjectType),
  componentGroup: (value: string) =>
    Object.values(ComponentType).includes(value as ComponentType),
  logType: (value: string) =>
    Object.values(RouterLogType).includes(value as RouterLogType)
};

export default function ValidateParamsRoute() {
  const params = useParams();
  const isValid = Object.entries(validators).every(
    ([param, validate]) => params[param] == undefined || validate(params[param])
  );

  return isValid ? <Outlet /> : <ViewNotFound />;
}
