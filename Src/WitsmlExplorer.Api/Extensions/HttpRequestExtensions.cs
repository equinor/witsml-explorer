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
            string[] headerSplitted = httpRequest.Headers[headerName].ToString().Split('@');
            if (headerSplitted.Length == 1 && !string.IsNullOrEmpty(headerSplitted[0]))
            {
                return new ServerCredentials()
                {
                    Host = new Uri(headerSplitted[0])
                };
            }
            else if (headerSplitted.Length == 2)
            {
                BasicCredentials creds = new(headerSplitted[0]);
                return new ServerCredentials()
                {
                    Creds = new BasicCredentials()
                    {
                        UserId = creds.UserId,
                        Password = delDecrypt(creds.Password) ?? creds.Password
                    },
                    Host = new Uri(headerSplitted[1])
                };
            }
            return new ServerCredentials();
        }

    }
}
