using System;

using Serilog;
using Serilog.Core;

using Witsml.Data;
using Witsml.ServiceReference;

namespace Witsml;

public interface IQueryLogger
{
    /// <summary>
    /// This method will be invoked after every call to Witsml server. It will contain information about the call, response and error (if any)
    /// </summary>
    /// <param name="function">Name of the Witsml function call</param>
    /// <param name="serverUrl">Witsml server Url</param>
    /// <param name="query">Witsml query</param>
    /// <param name="optionsIn">OptionsIn if applicable (could be null)</param>
    /// <param name="querySent">Xml request to the Witsml server (QueryIn/XMLin)</param>
    /// <param name="isSuccessful">if true - request was successful (resultCode > 0)</param>
    /// <param name="xmlReceived">Xml response from server (could be null)</param>
    /// <param name="resultCode">Result code from the witsml server (negative number means error code)</param>
    /// <param name="suppMsgOut">Result message from the witsml server</param>
    /// <typeparam name="T">IWitsmlQueryType</typeparam>
    void LogQuery<T>(string function, Uri serverUrl, T query, OptionsIn optionsIn, string querySent, bool isSuccessful,
        string xmlReceived, short resultCode, string suppMsgOut) where T : IWitsmlQueryType;
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

    public void LogQuery<T>(string function, Uri serverUrl, T query, OptionsIn optionsIn, string querySent, bool isSuccessful,
        string xmlReceived, short resultCode, string suppMsgOut) where T : IWitsmlQueryType
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
