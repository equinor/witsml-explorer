namespace Witsml.Data
{
    public interface IWitsmlQueryType
    {
        string TypeName { get; }
    }

    public interface IWitsmlGrowingDataQueryType : IWitsmlQueryType { }
}
