using System;
using System.IO;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Security;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;

using Serilog;

using Witsml.Data;
using Witsml.Extensions;
using Witsml.Metrics;
using Witsml.ServiceReference;
using Witsml.Xml;

namespace Witsml
{
    public interface IWitsmlClient
    {
        Task<T> GetFromStoreAsync<T>(T query, OptionsIn optionsIn, CancellationToken? cancellationToken = null) where T : IWitsmlQueryType, new();
        Task<T> GetFromStoreNullableAsync<T>(T query, OptionsIn optionsIn, CancellationToken? cancellationToken = null) where T : IWitsmlQueryType;
        Task<(T, short resultCode)> GetGrowingDataObjectFromStoreAsync<T>(T query, OptionsIn optionsIn, CancellationToken? cancellationToken = null) where T : IWitsmlGrowingDataQueryType, new();
        Task<string> GetFromStoreAsync(string query, OptionsIn optionsIn, CancellationToken? cancellationToken = null);
        Task<QueryResult> AddToStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<string> AddToStoreAsync(string query, OptionsIn optionsIn = null);
        Task<QueryResult> UpdateInStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<string> UpdateInStoreAsync(string query, OptionsIn optionsIn = null);
        Task<QueryResult> DeleteFromStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> DeleteFromStoreAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlQueryType;
        Task<string> DeleteFromStoreAsync(string query, OptionsIn optionsIn = null);
        Task<QueryResult> TestConnectionAsync();
        Task<WitsmlCapServers> GetCap();
        Uri GetServerHostname();
    }

    public class WitsmlClient : WitsmlClientBase, IWitsmlClient
    {
        private readonly string _clientCapabilities;
        private readonly StoreSoapPortClient _client;
        private readonly Uri _serverUrl;
        private IQueryLogger _queryLogger;
        private readonly WitsmlMetrics _witsmlMetrics;

        [Obsolete("Use the WitsmlClientOptions based constructor instead")]
        public WitsmlClient(string hostname, string username, string password, WitsmlClientCapabilities clientCapabilities, TimeSpan? requestTimeout = null,
            bool logQueries = false)
            : this(options =>
            {
                options.Hostname = hostname;
                options.Credentials = new WitsmlCredentials(username, password);
                options.ClientCapabilities = clientCapabilities;
                options.RequestTimeOut = requestTimeout ?? TimeSpan.FromSeconds(CommonConstants.DefaultClientRequestTimeOutSeconds);
                options.LogQueries = logQueries;
            })
        { }

        public WitsmlClient(Action<WitsmlClientOptions> options)
        {
            var witsmlClientOptions = new WitsmlClientOptions();
            options(witsmlClientOptions);

            ArgumentNullException.ThrowIfNull(witsmlClientOptions.Hostname);
            ArgumentNullException.ThrowIfNull(witsmlClientOptions.Credentials.Username);
            ArgumentNullException.ThrowIfNull(witsmlClientOptions.Credentials.Password);

            _clientCapabilities = witsmlClientOptions.ClientCapabilities.ToXml();
            _serverUrl = new Uri(witsmlClientOptions.Hostname);

            _client = CreateSoapClient(witsmlClientOptions);

            _witsmlMetrics = WitsmlMetrics.Instance;
            SetupQueryLogging(witsmlClientOptions.LogQueries);
        }

        private void SetupQueryLogging(bool logQueries)
        {
            if (!logQueries)
                return;

            SetQueryLogger(new DefaultQueryLogger());
        }

        public void SetQueryLogger(IQueryLogger queryLogger)
        {
            _queryLogger = queryLogger;
        }

        /// <summary>
        /// Returns one or more WITSML data-objects from the server
        /// </summary>
        /// <param name="query">The query that specifies what data-object(s) to be returned</param>
        /// <param name="optionsIn">For information about the OptionsIn, see WITSML specification</param>
        /// <param name="cancellationToken">Optional cancellation token. Cancels that task itself, but the server request is not aborted</param>
        /// <typeparam name="T">The Witsml type to be returned</typeparam>
        /// <returns>The deserialized results of type T</returns>
        /// <exception cref="Exception"></exception>
        public async Task<T> GetFromStoreAsync<T>(T query, OptionsIn optionsIn, CancellationToken? cancellationToken = null) where T : IWitsmlQueryType, new()
        {
            try
            {
                return await GetFromStoreInnerAsync(query, optionsIn, cancellationToken);
            }
            catch (XmlException e)
            {
                Log.Error(e, "Failed to deserialize response from Witsml server");
                return new T();
            }
        }

        /// <summary>
        /// Returns one or more WITSML data-objects from the server
        /// </summary>
        /// <param name="query">The query that specifies what data-object(s) to be returned</param>
        /// <param name="optionsIn">For information about the OptionsIn, see WITSML specification</param>
        /// <param name="cancellationToken">Optional cancellation token. Cancels that task itself, but the server request is not aborted</param>
        /// <typeparam name="T">The Witsml type to be returned</typeparam>
        /// <returns>The deserialized results of type T or null on exception</returns>
        public async Task<T> GetFromStoreNullableAsync<T>(T query, OptionsIn optionsIn, CancellationToken? cancellationToken = null) where T : IWitsmlQueryType
        {
            try
            {
                return await GetFromStoreInnerAsync(query, optionsIn, cancellationToken);
            }
            catch (XmlException e)
            {
                Log.Error(e, "Failed to deserialize response from Witsml server");
                return default;
            }
        }

        private async Task<T> GetFromStoreInnerAsync<T>(T query, OptionsIn optionsIn, CancellationToken? cancellationToken = null) where T : IWitsmlQueryType
        {
            WMLS_GetFromStoreRequest request = new()
            {
                WMLtypeIn = query.TypeName,
                OptionsIn = optionsIn.GetKeywords(),
                QueryIn = XmlHelper.Serialize(query),
                CapabilitiesIn = _clientCapabilities
            };

            try
            {
                WMLS_GetFromStoreResponse response =
                    await _witsmlMetrics.MeasureQuery(
                        _serverUrl,
                        WitsmlMethod.GetFromStore,
                        query.TypeName,
                        _client.WMLS_GetFromStoreAsync(request),
                        cancellationToken);

                LogQueriesSentAndReceived(
                    nameof(_client.WMLS_GetFromStoreAsync), this._serverUrl,
                    query, optionsIn, request.QueryIn,
                    response.IsSuccessful(), response.XMLout, response.Result,
                    response.SuppMsgOut);

                if (response.IsSuccessful())
                    return XmlHelper.Deserialize(response.XMLout, query);

                WMLS_GetBaseMsgResponse errorResponse =
                    await _client.WMLS_GetBaseMsgAsync(response.Result);
                throw new Exception(
                    $"Error while querying store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
            }
            catch (CommunicationObjectAbortedException)
            {
                return default;
            }
        }

        /// <summary>
        /// Returns one or more WITSML data-objects from the server
        /// </summary>
        /// <param name="query">The query that specifies what data-object(s) to be returned</param>
        /// <param name="optionsIn">For information about the OptionsIn, see WITSML specification</param>
        /// <param name="cancellationToken">Optional cancellation token. Cancels that task itself, but the server request is not aborted</param>
        /// <typeparam name="T">The Witsml type to be returned</typeparam>
        /// <returns>A tuple with the deserialized results and a resultCode where 1 indicates that the function completed successfully, 2 indicates partial success where some growing data-object data-nodes were not returned. Negative values are error codes</returns>
        /// <exception cref="Exception"></exception>
        public async Task<(T, short resultCode)> GetGrowingDataObjectFromStoreAsync<T>(T query, OptionsIn optionsIn, CancellationToken? cancellationToken = null) where T : IWitsmlGrowingDataQueryType, new()
        {
            try
            {
                WMLS_GetFromStoreRequest request = new()
                {
                    WMLtypeIn = query.TypeName,
                    OptionsIn = optionsIn.GetKeywords(),
                    QueryIn = XmlHelper.Serialize(query),
                    CapabilitiesIn = _clientCapabilities
                };

                WMLS_GetFromStoreResponse response = await _witsmlMetrics.MeasureQuery(
                    _serverUrl,
                    WitsmlMethod.GetFromStore,
                    query.TypeName,
                    _client.WMLS_GetFromStoreAsync(request),
                    cancellationToken);

                LogQueriesSentAndReceived(nameof(_client.WMLS_GetFromStoreAsync), this._serverUrl, query, optionsIn,
                    request.QueryIn, response.IsSuccessful(), response.XMLout, response.Result, response.SuppMsgOut);

                if (response.IsSuccessful())
                    return (XmlHelper.Deserialize(response.XMLout, query), response.Result);

                WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
                throw new Exception($"Error while querying store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
            }
            catch (XmlException e)
            {
                Log.Error(e, "Failed to deserialize response from Witsml server");
                return (new T(), -1);
            }
        }

        private static string GetQueryType(string query)
        {
            XmlReaderSettings settings = new()
            {
                IgnoreComments = true,
                IgnoreProcessingInstructions = true,
                IgnoreWhitespace = true,
                XmlResolver = null
            };
            using XmlReader reader = XmlReader.Create(new StringReader(query), settings);
            // attempt to read the query type from the first nested element, such as <logs><_log_>[...]</log></logs>
            reader.Read();
            reader.Read();
            if (string.IsNullOrEmpty(reader.Name))
            {
                throw new Exception("Could not determine WITSML type based on query");
            }
            return reader.Name;
        }

        public async Task<string> GetFromStoreAsync(string query, OptionsIn optionsIn, CancellationToken? cancellationToken = null)
        {
            string type = GetQueryType(query);
            WMLS_GetFromStoreRequest request = new()
            {
                WMLtypeIn = type,
                OptionsIn = optionsIn.GetKeywords(),
                QueryIn = query,
                CapabilitiesIn = _clientCapabilities
            };

            WMLS_GetFromStoreResponse response = await _witsmlMetrics.MeasureQuery(
                _serverUrl,
                WitsmlMethod.GetFromStore,
                type,
                _client.WMLS_GetFromStoreAsync(request),
                cancellationToken);

            LogQueriesSentAndReceived<IWitsmlQueryType>(nameof(_client.WMLS_GetFromStoreAsync), _serverUrl, null, optionsIn,
                    query, response.IsSuccessful(), response.XMLout, response.Result, response.SuppMsgOut);

            if (response.IsSuccessful())
                return response.XMLout;

            WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
            throw new Exception($"Error while querying store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
        }

        public async Task<QueryResult> AddToStoreAsync<T>(T query) where T : IWitsmlQueryType
        {
            try
            {
                OptionsIn optionsIn = new(ReturnElements.Requested);
                WMLS_AddToStoreRequest request = new()
                {
                    WMLtypeIn = query.TypeName,
                    OptionsIn = optionsIn.GetKeywords(),
                    XMLin = XmlHelper.Serialize(query),
                    CapabilitiesIn = _clientCapabilities
                };

                WMLS_AddToStoreResponse response = await _witsmlMetrics.MeasureQuery(
                    _serverUrl,
                    WitsmlMethod.AddToStore,
                    query.TypeName,
                    _client.WMLS_AddToStoreAsync(request));

                LogQueriesSentAndReceived(nameof(_client.WMLS_AddToStoreAsync), this._serverUrl, query, optionsIn,
                    request.XMLin, response.IsSuccessful(), null, response.Result, response.SuppMsgOut);

                if (response.IsSuccessful())
                    return new QueryResult(true);

                WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
                string message = $"Error while adding to store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}";
                return new QueryResult(false, message);
            }
            catch (MessageSecurityException e)
            {
                const string message = "Request forbidden. Verify credentials";
                Log.Error(e, message);
                return new QueryResult(false, message);
            }
        }

        public async Task<string> AddToStoreAsync(string query, OptionsIn optionsIn = null)
        {
            string type = GetQueryType(query);
            WMLS_AddToStoreRequest request = new()
            {
                WMLtypeIn = type,
                OptionsIn = optionsIn?.GetKeywords() ?? string.Empty,
                XMLin = query,
                CapabilitiesIn = _clientCapabilities
            };

            WMLS_AddToStoreResponse response = await _witsmlMetrics.MeasureQuery(
                _serverUrl,
                WitsmlMethod.AddToStore,
                type,
                _client.WMLS_AddToStoreAsync(request));

            LogQueriesSentAndReceived<IWitsmlQueryType>(nameof(_client.WMLS_AddToStoreAsync), _serverUrl, null, optionsIn,
                    query, response.IsSuccessful(), null, response.Result, response.SuppMsgOut);

            if (response.IsSuccessful())
                return "Function completed successfully";

            WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
            throw new Exception($"Error while adding to store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
        }

        public async Task<QueryResult> UpdateInStoreAsync<T>(T query) where T : IWitsmlQueryType
        {
            try
            {
                WMLS_UpdateInStoreRequest request = new()
                {
                    WMLtypeIn = query.TypeName,
                    XMLin = XmlHelper.Serialize(query),
                    OptionsIn = string.Empty,
                    CapabilitiesIn = _clientCapabilities
                };

                WMLS_UpdateInStoreResponse response = await _witsmlMetrics.MeasureQuery(
                    _serverUrl,
                    WitsmlMethod.UpdateInStore,
                    query.TypeName,
                    _client.WMLS_UpdateInStoreAsync(request));

                LogQueriesSentAndReceived(nameof(_client.WMLS_UpdateInStoreAsync), this._serverUrl, query, null,
                    request.XMLin, response.IsSuccessful(), null, response.Result, response.SuppMsgOut);

                if (response.IsSuccessful())
                    return new QueryResult(true);

                WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
                string message = $"Error while updating store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}";
                return new QueryResult(false, message);
            }
            catch (MessageSecurityException e)
            {
                const string message = "Request forbidden. Verify credentials";
                Log.Error(e, message);
                return new QueryResult(false, message);
            }
        }

        public async Task<string> UpdateInStoreAsync(string query, OptionsIn optionsIn = null)
        {
            string type = GetQueryType(query);
            WMLS_UpdateInStoreRequest request = new()
            {
                WMLtypeIn = type,
                OptionsIn = optionsIn?.GetKeywords() ?? string.Empty,
                XMLin = query,
                CapabilitiesIn = _clientCapabilities
            };

            WMLS_UpdateInStoreResponse response = await _witsmlMetrics.MeasureQuery(
                _serverUrl,
                WitsmlMethod.UpdateInStore,
                type,
                _client.WMLS_UpdateInStoreAsync(request));

            LogQueriesSentAndReceived<IWitsmlQueryType>(nameof(_client.WMLS_UpdateInStoreAsync), _serverUrl, null, optionsIn,
                    query, response.IsSuccessful(), null, response.Result, response.SuppMsgOut);

            if (response.IsSuccessful())
                return "Function completed successfully";

            WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
            throw new Exception($"Error while adding to store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
        }

        public Task<QueryResult> DeleteFromStoreAsync<T>(T query) where T : IWitsmlQueryType
        {
            return DeleteFromStoreAsyncImplementation(query);
        }

        public Task<QueryResult> DeleteFromStoreAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlQueryType
        {
            return DeleteFromStoreAsyncImplementation(query, optionsIn);
        }

        private async Task<QueryResult> DeleteFromStoreAsyncImplementation<T>(T query, OptionsIn optionsIn = null) where T : IWitsmlQueryType
        {
            try
            {
                WMLS_DeleteFromStoreRequest request = new()
                {
                    WMLtypeIn = query.TypeName,
                    QueryIn = XmlHelper.Serialize(query),
                    OptionsIn = optionsIn == null ? string.Empty : optionsIn.GetKeywords(),
                    CapabilitiesIn = _clientCapabilities
                };

                WMLS_DeleteFromStoreResponse response = await _witsmlMetrics.MeasureQuery(
                    _serverUrl,
                    WitsmlMethod.DeleteFromStore,
                    query.TypeName,
                    _client.WMLS_DeleteFromStoreAsync(request));

                LogQueriesSentAndReceived(nameof(_client.WMLS_DeleteFromStoreAsync), this._serverUrl, query, null,
                    request.QueryIn, response.IsSuccessful(), null, response.Result, response.SuppMsgOut);

                if (response.IsSuccessful())
                    return new QueryResult(true);

                WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
                string message = $"Error while deleting from store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}";
                return new QueryResult(false, message);
            }
            catch (MessageSecurityException e)
            {
                const string message = "Request forbidden. Verify credentials";
                Log.Error(e, message);
                return new QueryResult(false, message);
            }
        }

        public async Task<string> DeleteFromStoreAsync(string query, OptionsIn optionsIn = null)
        {
            string type = GetQueryType(query);
            WMLS_DeleteFromStoreRequest request = new()
            {
                WMLtypeIn = type,
                OptionsIn = optionsIn?.GetKeywords() ?? string.Empty,
                QueryIn = query,
                CapabilitiesIn = _clientCapabilities
            };

            WMLS_DeleteFromStoreResponse response = await _witsmlMetrics.MeasureQuery(
                _serverUrl,
                WitsmlMethod.DeleteFromStore,
                type,
                _client.WMLS_DeleteFromStoreAsync(request));

            LogQueriesSentAndReceived<IWitsmlQueryType>(nameof(_client.WMLS_DeleteFromStoreAsync), _serverUrl, null, optionsIn,
                    query, response.IsSuccessful(), null, response.Result, response.SuppMsgOut);

            if (response.IsSuccessful())
                return "Function completed successfully";

            WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
            throw new Exception($"Error while adding to store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
        }

        public async Task<QueryResult> TestConnectionAsync()
        {
            WMLS_GetVersionResponse response =
                await _witsmlMetrics.MeasureQuery(
                    _serverUrl,
                    WitsmlMethod.GetVersion,
                    "",
                    _client.WMLS_GetVersionAsync());

            if (string.IsNullOrEmpty(response.Result))
                throw new Exception("Error while testing connection: Server failed to return a valid version");

            // Spec requires a comma-seperated list of supported versions without spaces
            var versions = response.Result.Split(CommonConstants.DataSeparator);
            if (versions.All(v => v != "1.4.1.1"))
                throw new Exception("Error while testing connection: Server does not indicate support for WITSML 1.4.1.1");

            return new QueryResult(true);
        }

        public async Task<WitsmlCapServers> GetCap()
        {
            WMLS_GetCapResponse response = await _witsmlMetrics.MeasureQuery(
                _serverUrl,
                WitsmlMethod.GetCap,
                "",
                _client.WMLS_GetCapAsync(new WMLS_GetCapRequest("dataVersion=1.4.1.1")));

            if (response.IsSuccessful())
                return XmlHelper.Deserialize(response.CapabilitiesOut, new WitsmlCapServers());

            WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
            throw new Exception($"Error while querying store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
        }

        private void LogQueriesSentAndReceived<T>(string function, Uri serverUrl, T query, OptionsIn optionsIn,
            string querySent, bool isSuccessful, string xmlReceived, short resultCode, string suppMsgOut = null) where T : IWitsmlQueryType
        {
            _queryLogger?.LogQuery(function, serverUrl, query, optionsIn, querySent, isSuccessful, xmlReceived, resultCode, suppMsgOut);
        }

        public Uri GetServerHostname() => _serverUrl;
    }
}
