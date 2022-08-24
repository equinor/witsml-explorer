namespace WitsmlExplorer.Api.Models.Measure
{
    public class WellMeasure : Measure
    {
        public string Value { get; private init; }

        public static WellMeasure FromWitsmlMeasure(Witsml.Data.Measures.Measure witsmlMeasure)
        {
            return witsmlMeasure == null
                ? null
                : new WellMeasure
                {
                    Uom = witsmlMeasure.Uom,
                    Value = witsmlMeasure.Value
                };
        }
    }
}
