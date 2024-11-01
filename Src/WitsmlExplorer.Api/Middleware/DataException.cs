using System;
using System.Net;

namespace WitsmlExplorer.Api.Middleware
{
    public class DataException : Exception
    {
        public int StatusCode { get; private set; }

        public DataException(string message) : base(message)
        {
            StatusCode = (int)HttpStatusCode.InternalServerError;
        }
    }
}
