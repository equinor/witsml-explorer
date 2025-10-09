using System.Collections.Generic;
using System.Linq;

using Witsml.Data.DataWorkOrder;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class ConfigurationChangeReason
{
    public string ChangedBy { get; set; }
    public string DTimChanged { get; set; }
    public bool? IsChangedDataRequirements { get; set; }
    public string Comments { get; set; }
    public List<string> ChannelsAdded { get; set; }
    public List<string> ChannelsModified { get; set; }
    public List<string> ChannelsRemoved { get; set; }
}

public static class ConfigurationChangeReasonExtensions
{
    public static WitsmlConfigurationChangeReason ToWitsml(this ConfigurationChangeReason configurationChangeReason)
    {
        return new WitsmlConfigurationChangeReason
        {
            ChangedBy = configurationChangeReason.ChangedBy,
            DTimChanged = StringHelpers.ToUniversalDateTimeString(configurationChangeReason.DTimChanged),
            IsChangedDataRequirements = configurationChangeReason.IsChangedDataRequirements,
            Comments = configurationChangeReason.Comments,
            ChannelsAdded = configurationChangeReason.ChannelsAdded,
            ChannelsModified = configurationChangeReason.ChannelsModified,
            ChannelsRemoved = configurationChangeReason.ChannelsRemoved
        };
    }
}
