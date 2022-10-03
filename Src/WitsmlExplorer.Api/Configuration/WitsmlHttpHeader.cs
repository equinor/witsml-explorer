using System;
namespace WitsmlExplorer.Api.Configuration
{
    public class WitsmlHttpHeader
    {
        public BasicCredentials BasicCreds { get; init; }
        public Uri Uri { get; init; }
    }
}
