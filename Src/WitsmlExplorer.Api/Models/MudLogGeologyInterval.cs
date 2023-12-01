using System.Collections.Generic;
using System.Linq;

using Witsml.Data.Measures;
using Witsml.Data.MudLog;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class MudLogGeologyInterval
    {
        public string Uid { get; init; }
        public string TypeLithology { get; init; }
        public MeasureWithDatum MdTop { get; init; }
        public MeasureWithDatum MdBottom { get; init; }
        public MeasureWithDatum TvdTop { get; init; }
        public MeasureWithDatum TvdBase { get; init; }
        public LengthMeasure RopAv { get; init; }
        public LengthMeasure WobAv { get; init; }
        public LengthMeasure TqAv { get; init; }
        public LengthMeasure CurrentAv { get; init; }
        public LengthMeasure RpmAv { get; init; }
        public LengthMeasure WtMudAv { get; init; }
        public LengthMeasure EcdTdAv { get; init; }
        public string DxcAv { get; init; }
        public List<MudLogLithology> Lithologies { get; init; }
        public string Description { get; init; }
        public CommonTime CommonTime { get; init; }
    }

    public static class MudLogGeologyIntervalExtensions
    {
        public static WitsmlMudLogGeologyInterval ToWitsml(this MudLogGeologyInterval mudLogGeologyInterval)
        {
            return new WitsmlMudLogGeologyInterval
            {
                Uid = mudLogGeologyInterval.Uid,
                TypeLithology = mudLogGeologyInterval.TypeLithology,
                MdTop = mudLogGeologyInterval.MdTop?.ToWitsml<WitsmlMeasureWithDatum>(),
                MdBottom = mudLogGeologyInterval.MdBottom?.ToWitsml<WitsmlMeasureWithDatum>(),
                TvdTop = mudLogGeologyInterval.TvdTop?.ToWitsml<WitsmlMeasureWithDatum>(),
                TvdBase = mudLogGeologyInterval.TvdBase?.ToWitsml<WitsmlMeasureWithDatum>(),
                RopAv = mudLogGeologyInterval.RopAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                WobAv = mudLogGeologyInterval.WobAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                TqAv = mudLogGeologyInterval.TqAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                CurrentAv = mudLogGeologyInterval.CurrentAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                RpmAv = mudLogGeologyInterval.RpmAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                WtMudAv = mudLogGeologyInterval.WtMudAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                EcdTdAv = mudLogGeologyInterval.EcdTdAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                DxcAv = mudLogGeologyInterval.DxcAv,
                Lithologies = mudLogGeologyInterval.Lithologies?.Select(lithology => lithology?.ToWitsml())?.ToList(),
                Description = mudLogGeologyInterval.Description,
                CommonTime = mudLogGeologyInterval.CommonTime?.ToWitsml()
            };
        }
    }
}
