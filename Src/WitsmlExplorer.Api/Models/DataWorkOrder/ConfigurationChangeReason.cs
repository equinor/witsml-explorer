using System.Collections.Generic;
using System.Linq;

using Witsml.Data.DataWorkOrder;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class ConfigurationChangeReason
{
    public string ChangedBy { get; set; }
    public string DTimChanged { get; set; }
    public bool IsChangedDataRequirements { get; set; }
    public string Comments { get; set; }
    public List<string> ChannelAdded { get; set; }
    public List<string> ChannelModified { get; set; }
    public List<string> ChannelRemoved { get; set; }

}

public static class ConfigurationChangeReasonExtensions
{
    public static WitsmlConfigurationChangeReason ToWitsml(this ConfigurationChangeReason configurationChangeReason)
    {
        return new WitsmlConfigurationChangeReason
        {
            ChangedBy = configurationChangeReason.ChangedBy,
            DTimChanged = configurationChangeReason.DTimChanged,
            IsChangedDataRequirements = configurationChangeReason.IsChangedDataRequirements,
            Comments = configurationChangeReason.Comments,
            ChannelAdded = configurationChangeReason.ChannelAdded,
            ChannelModified = configurationChangeReason.ChannelModified,
            ChannelRemoved = configurationChangeReason.ChannelRemoved
        };
    }
}
