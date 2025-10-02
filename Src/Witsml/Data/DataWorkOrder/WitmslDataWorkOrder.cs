using System;
using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Extensions;

namespace Witsml.Data.DataWorkOrder
{
    public class WitsmlDataWorkOrder : WitsmlObjectOnWellbore
    {
        public override WitsmlDataWorkOrders AsItemInWitsmlList()
        {
            return new WitsmlDataWorkOrders()
            {
                DataWorkOrders = this.AsItemInList()
            };
        }

        [XmlElement("field")]
        public string Field { get; set; }

        [XmlElement("dataProvider")]
        public string DataProvider { get; set; }

        [XmlElement("dataConsumer")]
        public string DataConsumer { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("dTimPlannedStart")]
        public string DTimPlannedStart { get; set; }

        [XmlElement("dTimPlannedStart")]
        public string DTimPlannedStop { get; set; }

        [XmlElement("assetContact")]
        public List<WitsmlDataWorkOrderAssetContact> AssetContacts { get; set; }

        [XmlElement("dataSourceConfigurationSet")]
        public List<WitsmlDataSourceConfigurationSet> DataSourceConfigurationSets { get; set; }

        [XmlElement("extensionNameValue")]
        public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }

        [XmlElement("dwoVersion")]
        public string DwoVersion { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}

