using System;
namespace WitsmlExplorer.Api.Configuration
{
    public class ServerCredentials : ICredentials, IEquatable<ServerCredentials>
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
        public bool IsCredsNullOrEmpty()
        {
            return string.IsNullOrEmpty(UserId) || string.IsNullOrEmpty(Password);
        }
        public bool Equals(ServerCredentials other)
        {
            return (Host.ToString() == other.Host.ToString()) &&
            (UserId == other.UserId) &&
            (Password == other.Password);
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as ServerCredentials);
        }

        public override int GetHashCode()
        {
            return Host.GetHashCode() + UserId.GetHashCode() + Password.GetHashCode();
        }
    }
}
