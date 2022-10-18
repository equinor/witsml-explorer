using System;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Configuration;
namespace WitsmlExplorer.Api.Extensions
{
    public static class HttpRequestExtensions
    {
        /// The format for WitsmlServer Header value is : "b64(creds)@URL"
        public static ServerCredentials GetWitsmlServerHttpHeader(this HttpRequest httpRequest, string headerName, Func<string, string> delDecrypt)
        {
            return ParseServerHttpHeader(httpRequest.Headers[headerName].ToString(), delDecrypt);
        }

        public static ServerCredentials ParseServerHttpHeader(string headerValue, Func<string, string> delDecrypt)
        {
            string[] headerSplit = headerValue?.Split('@');
            if (headerSplit?.Length == 1 && !string.IsNullOrEmpty(headerSplit[0]))
            {
                return new ServerCredentials()
                {
                    Host = new Uri(headerSplit[0])
                };
            }
            else if (headerSplit?.Length == 2)
            {
                BasicCredentials creds = new(headerSplit[0]);
                return new ServerCredentials()
                {
                    UserId = creds.UserId,
                    Password = delDecrypt(creds.Password) ?? creds.Password,
                    Host = new Uri(headerSplit[1])
                };
            }
            return new ServerCredentials();
        }
    }
}
