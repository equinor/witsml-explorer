using System;
using System.Linq;
using System.ServiceModel.Security;
using System.Threading.Tasks;
using System.Xml;

using Serilog;

using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using Witsml.Xml;

namespace Witsml
{
    public interface IWitsmlClient
    {
        Task<T> GetFromStoreAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlQueryType, new();
        Task<T> GetFromStoreNullableAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlQueryType;
        Task<(T, short resultCode)> GetGrowingDataObjectFromStoreAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlGrowingDataQueryType, new();
        Task<string> GetFromStoreAsync(string query, OptionsIn optionsIn);
        Task<QueryResult> AddToStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> UpdateInStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> DeleteFromStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> TestConnectionAsync();
        Uri GetServerHostname();
    }

    public class WitsmlClient : WitsmlClientBase, IWitsmlClient
    {
        private readonly string _clientCapabilities;
        private readonly StoreSoapPortClient _client;
        private readonly Uri _serverUrl;
        private IQueryLogger _queryLogger;

        [Obsolete("Use the WitsmlClientOptions based constructor instead")]
        public WitsmlClient(string hostname, string username, string password, WitsmlClientCapabilities clientCapabilities, TimeSpan? requestTimeout = null,
            bool logQueries = false)
            : this(new WitsmlClientOptions
            {
                Hostname = hostname,
                Credentials = new WitsmlCredentials(username, password),
                ClientCapabilities = clientCapabilities,
                RequestTimeOut = requestTimeout ?? TimeSpan.FromMinutes(1),
                LogQueries = logQueries
            })
        { }

        public WitsmlClient(WitsmlClientOptions options)
        {
            ArgumentNullException.ThrowIfNull(options.Hostname);
            ArgumentNullException.ThrowIfNull(options.Credentials.Username);
            ArgumentNullException.ThrowIfNull(options.Credentials.Password);

            _clientCapabilities = options.ClientCapabilities.ToXml();
            _serverUrl = new Uri(options.Hostname);

            _client = CreateSoapClient(options);

            SetupQueryLogging(options.LogQueries);
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
        /// <typeparam name="T">The Witsml type to be returned</typeparam>
        /// <returns>The deserialized results of type T</returns>
        /// <exception cref="Exception"></exception>
        public async Task<T> GetFromStoreAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlQueryType, new()
        {
            try
            {
                return await GetFromStoreInnerAsync(query, optionsIn);
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
        /// <typeparam name="T">The Witsml type to be returned</typeparam>
        /// <returns>The deserialized results of type T or null on exception</returns>
        public async Task<T> GetFromStoreNullableAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlQueryType
        {
            try
            {
                return await GetFromStoreInnerAsync(query, optionsIn);
            }
            catch (XmlException e)
            {
                Log.Error(e, "Failed to deserialize response from Witsml server");
                return default;
            }
        }

        private async Task<T> GetFromStoreInnerAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlQueryType
        {
            WMLS_GetFromStoreRequest request = new()
            {
                WMLtypeIn = query.TypeName,
                OptionsIn = optionsIn.GetKeywords(),
                QueryIn = XmlHelper.Serialize(query),
                CapabilitiesIn = _clientCapabilities
            };

            WMLS_GetFromStoreResponse response = await _client.WMLS_GetFromStoreAsync(request);
            LogQueriesSentAndReceived(request.QueryIn, response.IsSuccessful(), response.XMLout);

            if (response.IsSuccessful())
                return XmlHelper.Deserialize(response.XMLout, query);

            WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
            throw new Exception($"Error while querying store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
        }

        /// <summary>
        /// Returns one or more WITSML data-objects from the server
        /// </summary>
        /// <param name="query">The query that specifies what data-object(s) to be returned</param>
        /// <param name="optionsIn">For information about the OptionsIn, see WITSML specification</param>
        /// <typeparam name="T">The Witsml type to be returned</typeparam>
        /// <returns>A tuple with the deserialized results and a resultCode where 1 indicates that the function completed successfully, 2 indicates partial success where some growing data-object data-nodes were not returned. Negative values are error codes</returns>
        /// <exception cref="Exception"></exception>
        public async Task<(T, short resultCode)> GetGrowingDataObjectFromStoreAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlGrowingDataQueryType, new()
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

                WMLS_GetFromStoreResponse response = await _client.WMLS_GetFromStoreAsync(request);
                LogQueriesSentAndReceived(request.QueryIn, response.IsSuccessful(), response.XMLout);

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

        public async Task<string> GetFromStoreAsync(string query, OptionsIn optionsIn)
        {
            XmlDocument xmlQuery = new();
            xmlQuery.LoadXml(query);
            string type = xmlQuery.FirstChild?.FirstChild?.Name;
            if (string.IsNullOrEmpty(type))
            {
                throw new Exception("Could not determine WITSML type based on query");
            }

            WMLS_GetFromStoreRequest request = new()
            {
                WMLtypeIn = type,
                OptionsIn = optionsIn.GetKeywords(),
                QueryIn = query,
                CapabilitiesIn = _clientCapabilities
            };

            WMLS_GetFromStoreResponse response = await _client.WMLS_GetFromStoreAsync(request);

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

                WMLS_AddToStoreResponse response = await _client.WMLS_AddToStoreAsync(request);
                LogQueriesSentAndReceived(request.XMLin, response.IsSuccessful());

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

                WMLS_UpdateInStoreResponse response = await _client.WMLS_UpdateInStoreAsync(request);
                LogQueriesSentAndReceived(request.XMLin, response.IsSuccessful());

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

        public async Task<QueryResult> DeleteFromStoreAsync<T>(T query) where T : IWitsmlQueryType
        {
            try
            {
                WMLS_DeleteFromStoreRequest request = new()
                {
                    WMLtypeIn = query.TypeName,
                    QueryIn = XmlHelper.Serialize(query),
                    OptionsIn = string.Empty,
                    CapabilitiesIn = _clientCapabilities
                };

                WMLS_DeleteFromStoreResponse response = await _client.WMLS_DeleteFromStoreAsync(request);
                LogQueriesSentAndReceived(request.QueryIn, response.IsSuccessful());

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

        public async Task<QueryResult> TestConnectionAsync()
        {
            WMLS_GetVersionResponse response = await _client.WMLS_GetVersionAsync();
            if (string.IsNullOrEmpty(response.Result))
            {
                throw new Exception("Error while testing connection: Server failed to return a valid version");
            }

            // Spec requires a comma-seperated list of supported versions without spaces
            var versions = response.Result.Split(',');
            if (versions.All(v => v != "1.4.1.1"))
                throw new Exception("Error while testing connection: Server does not indicate support for WITSML 1.4.1.1");

            return new QueryResult(true);
        }

        private void LogQueriesSentAndReceived(string querySent, bool isSuccessful, string xmlReceived = null)
        {
            _queryLogger?.LogQuery(querySent, isSuccessful, xmlReceived);
        }

        public Uri GetServerHostname() => _serverUrl;
    }
}
