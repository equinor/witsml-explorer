namespace Witsml;

public class QueryResult
{
    public bool IsSuccessful { get; }
    public string Reason { get; }

    public QueryResult(bool isSuccessful, string reason = null)
    {
        IsSuccessful = isSuccessful;
        Reason = reason;
    }
}
