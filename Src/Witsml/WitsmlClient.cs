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

    public class WitsmlClient : IWitsmlClient
    {
        private readonly string clientCapabilities;
        private readonly StoreSoapPortClient client;
        private readonly Uri serverUrl;
        private Logger queryLogger;

        public WitsmlClient(string hostname, string username, string password, WitsmlClientCapabilities clientCapabilities, bool logQueries = false)
        {
            if (string.IsNullOrEmpty(hostname)) throw new ArgumentNullException(nameof(hostname), "Hostname is required");
            if (string.IsNullOrEmpty(username)) throw new ArgumentNullException(nameof(username), "Username is required");
            if (string.IsNullOrEmpty(password)) throw new ArgumentNullException(nameof(password), "Password is required");

            this.clientCapabilities = clientCapabilities.ToXml();

            var serviceBinding = CreateBinding();
            var endpointAddress = new EndpointAddress(hostname);

            client = new StoreSoapPortClient(serviceBinding, endpointAddress);
            client.ClientCredentials.UserName.UserName = username;
            client.ClientCredentials.UserName.Password = password;
            serverUrl = new Uri(hostname);

            client.Endpoint.EndpointBehaviors.Add(new EndpointBehavior());
            SetupQueryLogging(logQueries);
        }

        private void SetupQueryLogging(bool logQueries)
        {
            if (!logQueries) return;
            queryLogger = new LoggerConfiguration()
                .WriteTo.File("queries.log", rollOnFileSizeLimit: true, retainedFileCountLimit: 1, fileSizeLimitBytes: 50000000)
                .CreateLogger();
        }

        private static BasicHttpsBinding CreateBinding()
        {
            var binding = new BasicHttpsBinding
            {
                Security =
                {
                    Mode = BasicHttpsSecurityMode.Transport,
                    Transport =
                    {
                        ClientCredentialType = HttpClientCredentialType.Basic
                    }
                },
                MaxReceivedMessageSize = int.MaxValue
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
                var request = new WMLS_GetFromStoreRequest
                {
                    WMLtypeIn = query.TypeName,
                    OptionsIn = optionsIn.GetKeywords(),
                    QueryIn = XmlHelper.Serialize(query),
                    CapabilitiesIn = clientCapabilities
                };

                var response = await client.WMLS_GetFromStoreAsync(request);
                LogQueriesSentAndReceived(request.QueryIn, response.IsSuccessful(), response.XMLout);

                if (response.IsSuccessful())
                {
                    return XmlHelper.Deserialize<T>(response.XMLout);
                }

                var errorResponse = await client.WMLS_GetBaseMsgAsync(response.Result);
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
                var request = new WMLS_GetFromStoreRequest
                {
                    WMLtypeIn = query.TypeName,
                    OptionsIn = optionsIn.GetKeywords(),
                    QueryIn = XmlHelper.Serialize(query),
                    CapabilitiesIn = clientCapabilities
                };

                var response = await client.WMLS_GetFromStoreAsync(request);
                LogQueriesSentAndReceived(request.QueryIn, response.IsSuccessful(), response.XMLout);

                if (response.IsSuccessful())
                {
                    return (XmlHelper.Deserialize<T>(response.XMLout), response.Result);
                }

                var errorResponse = await client.WMLS_GetBaseMsgAsync(response.Result);
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
            var xmlQuery = new XmlDocument();
            xmlQuery.LoadXml(query);
            var type = xmlQuery.FirstChild?.FirstChild?.Name;
            if (string.IsNullOrEmpty(type))
                throw new Exception("Could not determine WITSML type based on query");

            var request = new WMLS_GetFromStoreRequest
            {
                WMLtypeIn = type,
                OptionsIn = optionsIn.GetKeywords(),
                QueryIn = query,
                CapabilitiesIn = clientCapabilities
            };

            var response = await client.WMLS_GetFromStoreAsync(request);

            if (response.IsSuccessful())
                return response.XMLout;

            var errorResponse = await client.WMLS_GetBaseMsgAsync(response.Result);
            throw new Exception($"Error while querying store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
        }

        public async Task<QueryResult> AddToStoreAsync<T>(T query) where T : IWitsmlQueryType
        {
            try
            {
                var optionsIn = new OptionsIn(ReturnElements.Requested);
                var request = new WMLS_AddToStoreRequest
                {
                    WMLtypeIn = query.TypeName,
                    OptionsIn = optionsIn.GetKeywords(),
                    XMLin = XmlHelper.Serialize(query),
                    CapabilitiesIn = clientCapabilities
                };

                var response = await client.WMLS_AddToStoreAsync(request);
                LogQueriesSentAndReceived(request.XMLin, response.IsSuccessful());

                if (response.IsSuccessful()) return new QueryResult(true);

                var errorResponse = await client.WMLS_GetBaseMsgAsync(response.Result);
                var message = $"Error while adding to store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}";
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
                var request = new WMLS_UpdateInStoreRequest
                {
                    WMLtypeIn = query.TypeName,
                    XMLin = XmlHelper.Serialize(query),
                    OptionsIn = string.Empty,
                    CapabilitiesIn = clientCapabilities
                };

                var response = await client.WMLS_UpdateInStoreAsync(request);
                LogQueriesSentAndReceived(request.XMLin, response.IsSuccessful());

                if (response.IsSuccessful()) return new QueryResult(true);

                var errorResponse = await client.WMLS_GetBaseMsgAsync(response.Result);
                var message = $"Error while updating store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}";
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
                var request = new WMLS_DeleteFromStoreRequest
                {
                    WMLtypeIn = query.TypeName,
                    QueryIn = XmlHelper.Serialize(query),
                    OptionsIn = string.Empty,
                    CapabilitiesIn = clientCapabilities
                };

                var response = await client.WMLS_DeleteFromStoreAsync(request);
                LogQueriesSentAndReceived(request.QueryIn, response.IsSuccessful());

                if (response.IsSuccessful()) return new QueryResult(true);

                var errorResponse = await client.WMLS_GetBaseMsgAsync(response.Result);
                var message = $"Error while deleting from store: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}";
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
            var request = new WMLS_GetCapRequest
            {
                OptionsIn = "dataVersion=1.4.1.1"
            };

            var response = await client.WMLS_GetCapAsync(request);
            if (response.IsSuccessful()) return new QueryResult(true);

            var errorResponse = await client.WMLS_GetBaseMsgAsync(response.Result);
            throw new Exception($"Error while testing connection: {response.Result} - {errorResponse.Result}. {response.SuppMsgOut}");
        }

        private void LogQueriesSentAndReceived(string querySent, bool isSuccessful, string xmLReceived = null)
        {
            if (queryLogger == null) return;

            if (xmLReceived != null)
            {
                queryLogger.Information("Query: \n{Query}\nReceived: \n{Response}\nIsSuccessful: {IsSuccessful}", querySent, xmLReceived, isSuccessful);
            }
            else
            {
                queryLogger.Information("Query: \n{Query}\nIsSuccessful: {IsSuccessful}", querySent, isSuccessful);
            }
        }

        public Uri GetServerHostname()
        {
            return serverUrl;
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
