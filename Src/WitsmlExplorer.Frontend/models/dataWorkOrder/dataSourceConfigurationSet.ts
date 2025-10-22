import DataSourceConfiguration from "models/dataWorkOrder/dataSourceConfiguration";

export default interface DataSourceConfigurationSet {
  uid: string;
  dataSourceConfigurations: DataSourceConfiguration[];
}

export const getLastDataSourceConfiguration = (
  dataSourceConfigurationSet: DataSourceConfigurationSet
) =>
  dataSourceConfigurationSet?.dataSourceConfigurations?.reduce(
    (last, current) =>
      last == null || (current.versionNumber ?? 0) > (last.versionNumber ?? 0)
        ? current
        : last,
    null
  );
