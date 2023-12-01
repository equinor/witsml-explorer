using Witsml.Data;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class TrajRawData
    {
        public LengthMeasure MagTran1Raw { get; init; }
        public LengthMeasure MagTran2Raw { get; init; }
    }

    public static class TrajRawDataExtensions
    {
        public static WitsmlTrajRawData ToWitsml(this TrajRawData trajRawData)
        {
            return new WitsmlTrajRawData
            {
                MagTran1Raw = trajRawData.MagTran1Raw?.ToWitsml<Witsml.Data.Measures.Measure>(),
                MagTran2Raw = trajRawData.MagTran2Raw?.ToWitsml<Witsml.Data.Measures.Measure>()
            };
        }
    }
}
