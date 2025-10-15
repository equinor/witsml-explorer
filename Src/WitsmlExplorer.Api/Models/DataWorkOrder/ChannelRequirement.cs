using Witsml.Data.DataWorkOrder;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;


public class ChannelRequirement
{
    public string Uid { get; set; }
    public string Purpose { get; set; }
    public TimeMeasure MinInterval { get; set; }
    public TimeMeasure MaxInterval { get; set; }
    public LengthMeasure MinPrecision { get; set; }
    public LengthMeasure MaxPrecision { get; set; }
    public LengthMeasure MinValue { get; set; }
    public LengthMeasure MaxValue { get; set; }
    public LengthMeasure MinStep { get; set; }
    public LengthMeasure MaxStep { get; set; }
    public LengthMeasure MinDelta { get; set; }
    public LengthMeasure MaxDelta { get; set; }
    public TimeMeasure Latency { get; set; }
    public LengthMeasure MdThreshold { get; set; }
    public bool? DynamicMdThreshold { get; set; }
    public string Comments { get; set; }
}

public static class ChannelRequirementExtensions
{
    public static WitsmlChannelRequirement ToWitsml(this ChannelRequirement channelRequirement)
    {
        return new WitsmlChannelRequirement
        {
            Uid = channelRequirement.Uid,
            Purpose = channelRequirement.Purpose,
            MinInterval = channelRequirement.MinInterval.ToWitsml<WitsmlTimeMeasure>(),
            MaxInterval = channelRequirement.MaxInterval.ToWitsml<WitsmlTimeMeasure>(),
            MinPrecision = channelRequirement.MinPrecision.ToWitsml<Witsml.Data.Measures.Measure>(),
            MaxPrecision = channelRequirement.MaxPrecision.ToWitsml<Witsml.Data.Measures.Measure>(),
            MinValue = channelRequirement.MinValue.ToWitsml<Witsml.Data.Measures.Measure>(),
            MaxValue = channelRequirement.MaxValue.ToWitsml<Witsml.Data.Measures.Measure>(),
            MinStep = channelRequirement.MinStep.ToWitsml<WitsmlLengthMeasure>(),
            MaxStep = channelRequirement.MaxStep.ToWitsml<WitsmlLengthMeasure>(),
            Latency = channelRequirement.Latency.ToWitsml<WitsmlTimeMeasure>(),
            MinDelta = channelRequirement.MinDelta.ToWitsml<Witsml.Data.Measures.Measure>(),
            MaxDelta = channelRequirement.MaxDelta.ToWitsml<Witsml.Data.Measures.Measure>(),
            MdThreshold = channelRequirement.MdThreshold.ToWitsml<WitsmlLengthMeasure>(),
            DynamicMdThreshold = channelRequirement.DynamicMdThreshold,
            Comments = channelRequirement.Comments,
        };
    }
}
