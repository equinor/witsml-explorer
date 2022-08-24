using System;
using System.ServiceModel;
using System.ServiceModel.Security;
using System.Threading.Tasks;
using System.Xml;

using Serilog;
using Serilog.Core;

using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using Witsml.Xml;

namespace Witsml
{
    public interface IWitsmlClient
    {
        Task<T> GetFromStoreAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlQueryType, new();
        Task<(T, short resultCode)> GetGrowingDataObjectFromStoreAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlGrowingDataQueryType, new();
        Task<string> GetFromStoreAsync(string query, OptionsIn optionsIn);
        Task<QueryResult> AddToStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> UpdateInStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> DeleteFromStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> TestConnectionAsync();
        Uri GetServerHostname();
    }

    public class WitsmlClient : IWitsmlClient, IDisposable
    {
        private readonly string _clientCapabilities;
        private readonly StoreSoapPortClient _client;
        private readonly Uri _serverUrl;
        private Logger _queryLogger;

        public WitsmlClient(string hostname, string username, string password, WitsmlClientCapabilities clientCapabilities, TimeSpan? requestTimeout = null, bool logQueries = false)
        {
            if (string.IsNullOrEmpty(hostname))
            {
                throw new ArgumentNullException(nameof(hostname), "Hostname is required");
            }

            if (string.IsNullOrEmpty(username))
            {
                throw new ArgumentNullException(nameof(username), "Username is required");
            }

            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentNullException(nameof(password), "Password is required");
            }

            _clientCapabilities = clientCapabilities.ToXml();

            BasicHttpsBinding serviceBinding = CreateBinding(requestTimeout ?? TimeSpan.FromMinutes(1));
            EndpointAddress endpointAddress = new(hostname);

            _client = new StoreSoapPortClient(serviceBinding, endpointAddress);
            _client.ClientCredentials.UserName.UserName = username;
            _client.ClientCredentials.UserName.Password = password;
            _serverUrl = new Uri(hostname);

            _client.Endpoint.EndpointBehaviors.Add(new EndpointBehavior());
            SetupQueryLogging(logQueries);
        }

        private void SetupQueryLogging(bool logQueries)
        {
            if (!logQueries)
            {
                return;
            }

            _queryLogger = new LoggerConfiguration()
                .WriteTo.File("queries.log", rollOnFileSizeLimit: true, retainedFileCountLimit: 1, fileSizeLimitBytes: 50000000)
                .CreateLogger();
        }

        private static BasicHttpsBinding CreateBinding(TimeSpan requestTimeout)
        {
            BasicHttpsBinding binding = new()
            {
                Security =
                {
                    Mode = BasicHttpsSecurityMode.Transport,
                    Transport =
                    {
                        ClientCredentialType = HttpClientCredentialType.Basic
                    }
                },
                MaxReceivedMessageSize = int.MaxValue,
                SendTimeout = requestTimeout
            };
            return binding;
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
                {
                    return XmlHelper.Deserialize<T>(response.XMLout);
                }

                WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
                throw new Exception($"Error while querying store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
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
                {
                    return (XmlHelper.Deserialize<T>(response.XMLout), response.Result);
                }

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
            {
                return response.XMLout;
            }

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
                {
                    return new QueryResult(true);
                }

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
                {
                    return new QueryResult(true);
                }

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
                {
                    return new QueryResult(true);
                }

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
            WMLS_GetCapRequest request = new()
            {
                OptionsIn = "dataVersion=1.4.1.1"
            };

            WMLS_GetCapResponse response = await _client.WMLS_GetCapAsync(request);
            if (response.IsSuccessful())
            {
                return new QueryResult(true);
            }

            WMLS_GetBaseMsgResponse errorResponse = await _client.WMLS_GetBaseMsgAsync(response.Result);
            throw new Exception($"Error while testing connection: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
        }

        private void LogQueriesSentAndReceived(string querySent, bool isSuccessful, string xmLReceived = null)
        {
            if (_queryLogger == null)
            {
                return;
            }

            if (xmLReceived != null)
            {
                _queryLogger.Information("Query: \n{Query}\nReceived: \n{Response}\nIsSuccessful: {IsSuccessful}", querySent, xmLReceived, isSuccessful);
            }
            else
            {
                _queryLogger.Information("Query: \n{Query}\nIsSuccessful: {IsSuccessful}", querySent, isSuccessful);
            }
        }

        public Uri GetServerHostname()
        {
            return _serverUrl;
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }
    }

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
}
