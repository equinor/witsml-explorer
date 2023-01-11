using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Middleware
{
    public class WitsmlClientProviderException : Exception
    {
        public int StatusCode { get; private set; }

        public ServerType Server { get; private set; }

        public WitsmlClientProviderException(string message, int statusCode, ServerType server) : base(message)
        {
            StatusCode = statusCode;
            Server = server;
        }
    }

    public class WitsmlClientProviderExceptionDetails : ErrorDetails
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ServerType Server { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        }
    }

    public enum ServerType
    {
        Target,
        Source
    }
}
