import DataSourceConfiguration from "models/dataWorkOrder/dataSourceConfiguration";

export default interface DataSourceConfigurationSet {
  uid: string;
  dataSourceConfigurations: DataSourceConfiguration[];
}
