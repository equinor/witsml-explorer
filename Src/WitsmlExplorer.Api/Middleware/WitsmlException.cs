using System;

namespace WitsmlExplorer.Api.Middleware
{
    public class WitsmlResultParsingException : Exception
    {
        public WitsmlResultParsingException(string message, int statusCode) : base(message)
        {
            StatusCode = statusCode;
        }
        public int StatusCode { get; private set; }
    }
}
