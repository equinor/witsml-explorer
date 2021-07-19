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
        Task<QueryResult> AddToStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> UpdateInStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> DeleteFromStoreAsync<T>(T query) where T : IWitsmlQueryType;
        Task<QueryResult> TestConnectionAsync();
        Uri GetServerHostname();
    }

    public class WitsmlClient : IWitsmlClient
    {
        private readonly StoreSoapPortClient client;
        private readonly Uri serverUrl;
        private Logger queryLogger;

        public WitsmlClient(string hostname, string username, string password, bool logQueries = false)
        {
            if (string.IsNullOrEmpty(hostname)) throw new ArgumentNullException(nameof(hostname), "Hostname is required");
            if (string.IsNullOrEmpty(username)) throw new ArgumentNullException(nameof(username), "Username is required");
            if (string.IsNullOrEmpty(password)) throw new ArgumentNullException(nameof(password), "Password is required");

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

        public async Task<T> GetFromStoreAsync<T>(T query, OptionsIn optionsIn) where T : IWitsmlQueryType, new()
        {
            try
            {
                var request = new WMLS_GetFromStoreRequest
                {
                    WMLtypeIn = query.TypeName,
                    OptionsIn = optionsIn.GetKeywords(),
                    QueryIn = XmlHelper.Serialize(query),
                    CapabilitiesIn = ""
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

        public async Task<QueryResult> AddToStoreAsync<T>(T query) where T : IWitsmlQueryType
        {
            try
            {
                var optionsIn = new OptionsIn(ReturnElements.Requested);
                var request = new WMLS_AddToStoreRequest
                {
                    WMLtypeIn = query.TypeName,
                    OptionsIn = optionsIn.GetKeywords(),
                    XMLin = XmlHelper.Serialize(query)
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
                    XMLin = XmlHelper.Serialize(query)
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
                    QueryIn = XmlHelper.Serialize(query)
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
            var optionsIn = new OptionsIn(ReturnElements.HeaderOnly);
            var request = new WMLS_GetCapRequest
            {
                OptionsIn = optionsIn.GetKeywords()
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
