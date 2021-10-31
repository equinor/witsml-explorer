namespace WitsmlExplorer.Api.Models.Measure
{
    public class WellMeasure : Measure
    {
        public string Value { get; private init; }

        public static WellMeasure FromWitsmlMeasure(Witsml.Data.Measures.Measure witsmlMeasure)
        {
            if (witsmlMeasure == null)
                return null;

            return new WellMeasure
            {
                Uom = witsmlMeasure.Uom,
                Value = witsmlMeasure.Value
            };
        }
    }
}
