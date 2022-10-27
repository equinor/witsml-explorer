using System;

namespace WitsmlExplorer.Api.Models
{
    public class WitsmlException : Exception
    {
        public WitsmlException(string message) : base(message) { }

    }
}
