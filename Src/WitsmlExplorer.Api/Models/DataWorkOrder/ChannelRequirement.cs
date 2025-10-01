using Witsml.Data.DataWorkOrder;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;


public class ChannelRequirement
{
    public string Uid { get; set; }
    public RequirementPurpose Purpose { get; set; }
    public TimeMeasure MinInterval { get; set; }
    public TimeMeasure MaxInterval { get; set; }
    public Measure.Measure MinPrecision { get; set; }
    public Measure.Measure MaxPrecision { get; set; }
    public Measure.Measure MinValue { get; set; }
    public Measure.Measure MaxValue { get; set; }
    public LengthMeasure MinStep { get; set; }
    public LengthMeasure MaxStep { get; set; }
    public Measure.Measure MinDelta { get; set; }
    public Measure.Measure MaxDelta { get; set; }
    public TimeMeasure Latency { get; set; }
    public LengthMeasure MdThreshold { get; set; }
    public bool DynamicMdThreshold { get; set; }
    public string Comments { get; set; }
}

public static class ChannelRequirementExtensions
{
    public static WitsmlChannelRequirement ToWitsml(this ChannelRequirement channelRequirement)
    {
        return new WitsmlChannelRequirement
        {
            Uid = channelRequirement.Uid,
            Purpose = channelRequirement.Purpose.ConvertEnum<WitsmlRequirementPurpose>(),
            MinInterval = channelRequirement.MinInterval.ToWitsml<WitsmlTimeMeasure>(),
            MaxInterval = channelRequirement.MaxInterval.ToWitsml<WitsmlTimeMeasure>(),
            MinStep = channelRequirement.MinStep.ToWitsml<WitsmlLengthMeasure>(),
            MaxStep = channelRequirement.MaxStep.ToWitsml<WitsmlLengthMeasure>(),
            Latency = channelRequirement.Latency.ToWitsml<WitsmlTimeMeasure>(),
            MdThreshold = channelRequirement.MdThreshold.ToWitsml<WitsmlLengthMeasure>(),
            DynamicMdThreshold = channelRequirement.DynamicMdThreshold,
            Comments = channelRequirement.Comments
        };
    }
}
