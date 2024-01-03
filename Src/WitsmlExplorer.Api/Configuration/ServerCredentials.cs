using System;

using Witsml.Extensions;

namespace WitsmlExplorer.Api.Configuration
{
    public class ServerCredentials : BasicCredentials, ICredentials, IEquatable<ServerCredentials>
    {
        public ServerCredentials() { }

        public ServerCredentials(string host, string userid, string password) : base(userid, password)
        {
            Host = new Uri(host);
        }
        public ServerCredentials(string host, ICredentials creds)
        {
            Host = new Uri(host);
            UserId = creds.UserId;
            Password = creds.Password;
        }
        public Uri Host { get; init; }

        public bool Equals(ServerCredentials other)
        {
            return (other != null && Host.EqualsIgnoreCase(other.Host)) &&
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
