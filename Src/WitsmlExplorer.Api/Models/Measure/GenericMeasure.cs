namespace WitsmlExplorer.Api.Models.Measure;

public class GenericMeasure : Measure
{
    public T ToWitsml<T>() where T : Witsml.Data.Measures.Measure, new()
    {
        return new()
        {
            Uom = Uom,
        };
    }

    public static T ToEmptyWitsml<T>() where T : Witsml.Data.Measures.Measure, new()
    {
        return new()
        {
            Uom = "",
        };
    }

    public static GenericMeasure FromWitsml(Witsml.Data.Measures.Measure witsmlMeasure)
    {
        if (witsmlMeasure == null)
        {
            return null;
        }
        return new()
        {
            Uom = witsmlMeasure.Uom,
        };
    }
}
