using System;

namespace WitsmlExplorer.Api.Middleware
{
    public class EtpEndpointNotConfiguredException : Exception
    {
        public EtpEndpointNotConfiguredException(string message) : base(message)
        {
        }
    }
}
