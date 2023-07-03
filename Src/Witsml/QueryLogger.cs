using Serilog;
using Serilog.Core;

namespace Witsml;

public interface IQueryLogger
{
    void LogQuery(string querySent, bool isSuccessful, string xmlReceived = null);
}

public class DefaultQueryLogger : IQueryLogger
{
    private readonly Logger _queryLogger;

    public DefaultQueryLogger()
    {
        _queryLogger = new LoggerConfiguration()
            .WriteTo.File("queries.log", rollOnFileSizeLimit: true, retainedFileCountLimit: 1, fileSizeLimitBytes: 50000000)
            .CreateLogger();
    }

    public void LogQuery(string querySent, bool isSuccessful, string xmlReceived = null)
    {
        if (xmlReceived != null)
        {
            _queryLogger.Information("Query: \n{Query}\nReceived: \n{Response}\nIsSuccessful: {IsSuccessful}", querySent, xmlReceived, isSuccessful);
        }
        else
        {
            _queryLogger.Information("Query: \n{Query}\nIsSuccessful: {IsSuccessful}", querySent, isSuccessful);
        }
    }
}
