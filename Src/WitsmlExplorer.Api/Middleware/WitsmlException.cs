using System;

namespace WitsmlExplorer.Api.Middleware
{
    public class WitsmlException : Exception
    {
        public WitsmlException(string message, int statusCode) : base(message)
        {
            StatusCode = statusCode;
        }
        public int StatusCode { get; private set; }
    }
}
