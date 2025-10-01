using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

using Witsml.Data;
using Witsml.Data.DataWorkOrder;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class DataWorkOrder : ObjectOnWellbore
{
    public string Field { get; set; }

    public string DataProvider { get; set; }

    public string DataConsumer { get; set; }

    public string Description { get; set; }

    public string DTimPlannedStart { get; set; }

    public string DTimPlannedStop { get; set; }

    public List<DataWorkOrderAssetContact> AssetContacts { get; set; }

    public List<DataSourceConfigurationSet> DataSourceConfigurationSets { get; set; }

    public string DwoVersion { get; set; }

    public CommonData CommonData { get; init; }

    public override WitsmlDataWorkOrders ToWitsml()
    {
        return new WitsmlDataWorkOrder
        {
            UidWell = WellUid,
            NameWell = WellName,
            UidWellbore = WellboreUid,
            NameWellbore = WellboreName,
            Uid = Uid,
            Name = Name,
            Field = Field,
            DataProvider = DataProvider,
            DataConsumer = DataConsumer,
            Description = Description,
            DTimPlannedStart = DTimPlannedStart,
            DTimPlannedStop = DTimPlannedStop,
            AssetContacts = AssetContacts?.Select(assetContact => assetContact?.ToWitsml())?.ToList(),
            DataSourceConfigurationSets = DataSourceConfigurationSets?.Select(configurationSet => configurationSet?.ToWitsml())?.ToList(),
            DwoVersion = DwoVersion,
            CommonData = CommonData?.ToWitsml(),
        }.AsItemInWitsmlList();
    }
}

