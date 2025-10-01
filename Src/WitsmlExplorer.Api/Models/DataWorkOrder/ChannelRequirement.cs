namespace WitsmlExplorer.Api.Models.DataWorkOrder;

using WitsmlExplorer.Api.Models.Measure;
public class ChannelRequirement
{
    public string Uid { get; set; }
    public RequirementPurpose Purpose { get; set; }
    public TimeMeasure MinInterval { get; set; }
    public TimeMeasure MaxInterval { get; set; }
    public Measure MinPrecision { get; set; }
    public Measure MaxPrecision { get; set; }
    public Measure MinValue { get; set; }
    public Measure MaxValue { get; set; }
    public LengthMeasure MinStep { get; set; }
    public LengthMeasure MaxStep { get; set; }
    public Measure MinDelta { get; set; }
    public Measure MaxDelta { get; set; }
    public TimeMeasure Latency { get; set; }
    public LengthMeasure MdThreshold { get; set; }
    public bool DynamicMdThreshold { get; set; }
    public string Comments { get; set; }

}
