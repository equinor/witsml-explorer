using System;
using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data.DataWorkOrder
{
    public class WitsmlDataWorker : WitsmlObjectOnWellbore
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
        public DateTime DTimPlannedStart { get; set; }

        [XmlElement("dTimPlannedStart")]
        public DateTime DTimPlannedStop { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }

        [XmlElement("assetContact")]
        public WitsmlDataWorkOrderAssetContact[] AssetContact { get; set; }

        [XmlElement("dataSourceConfigurationSet")]
        public WitsmlDataSourceConfigurationSet[] DataSourceConfigurationSet { get; set; }

        [XmlElement("extensionNameValue")]
        WitsmlExtensionNameValue[] ExtensionNameValue { get; set; }

    }
}

