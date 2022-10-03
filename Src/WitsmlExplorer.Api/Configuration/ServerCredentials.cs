using System;
namespace WitsmlExplorer.Api.Configuration
{
    public class ServerCredentials : ICredentials
    {
        public ServerCredentials() { }

        public ServerCredentials(string host, string userid, string password)
        {
            Host = new Uri(host);
            Creds = new BasicCredentials()
            {
                UserId = userid,
                Password = password
            };
        }
        public ServerCredentials(string host, ICredentials creds)
        {
            Host = new Uri(host);
            Creds = new BasicCredentials()
            {
                UserId = creds.UserId,
                Password = creds.Password
            };
        }
        public Uri Host { get; init; }
        public ICredentials Creds { get; init; }
        public string UserId => Creds?.UserId;
        public string Password => Creds?.Password;
        public bool IsNullOrEmpty()
        {
            return string.IsNullOrEmpty(Host.ToString()) || string.IsNullOrEmpty(UserId) || string.IsNullOrEmpty(Password);
        }

    }
}
