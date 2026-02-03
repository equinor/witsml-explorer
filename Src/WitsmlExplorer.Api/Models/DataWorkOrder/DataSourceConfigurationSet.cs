using System.Collections.Generic;
using System.Linq;

using Witsml.Data.DataWorkOrder;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class DataSourceConfigurationSet
{
    public string Uid { get; set; }

    public List<DataSourceConfiguration> DataSourceConfigurations { get; set; }

}

public static class DataSourceConfigurationSetExtensions
{
    public static WitsmlDataSourceConfigurationSet ToWitsml(this DataSourceConfigurationSet configurationSet)
    {
        return new WitsmlDataSourceConfigurationSet
        {
            Uid = configurationSet.Uid,
            DataSourceConfigurations = configurationSet.DataSourceConfigurations.Select(configuration => configuration?.ToWitsml())?.ToList(),
        };
    }
}
