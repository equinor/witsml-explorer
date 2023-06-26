using System;

namespace WitsmlExplorer.Api.Middleware
{
    public class WitsmlUnsupportedCapabilityException : Exception
    {
        public int StatusCode { get; private set; }

        public WitsmlUnsupportedCapabilityException(string message) : base(message)
        {
            StatusCode = 500;
        }
    }
}
