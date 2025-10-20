import CommonData from "models/commonData";
import AssetContact from "models/dataWorkOrder/assetContact";
import DataSourceConfigurationSet from "models/dataWorkOrder/dataSourceConfigurationSet";
import ObjectOnWellbore from "models/objectOnWellbore";

export default interface DataWorkOrder extends ObjectOnWellbore {
  field: string;
  dataProvider: string;
  dataConsumer: string;
  description: string;
  dTimPlannedStart: string;
  dTimPlannedStop: string;
  assetContacts: AssetContact[];
  dataSourceConfigurationSets: DataSourceConfigurationSet[];
  commonData: CommonData;
}
