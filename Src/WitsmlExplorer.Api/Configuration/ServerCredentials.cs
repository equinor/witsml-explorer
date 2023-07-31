using System;

using Witsml.Extensions;

namespace WitsmlExplorer.Api.Configuration
{
    public class ServerCredentials : ICredentials, IEquatable<ServerCredentials>
    {
        public ServerCredentials() { }

        public ServerCredentials(string host, string userid, string password)
        {
            Host = new Uri(host);
            UserId = userid;
            Password = password;
        }
        public ServerCredentials(string host, ICredentials creds)
        {
            Host = new Uri(host);
            UserId = creds.UserId;
            Password = creds.Password;
        }
        public Uri Host { get; init; }
        public string UserId { get; init; }
        public string Password { get; init; }
        public bool IsCredsNullOrEmpty()
        {
            return string.IsNullOrEmpty(UserId) || string.IsNullOrEmpty(Password);
        }
        public bool Equals(ServerCredentials other)
        {
            return (Host == other.Host) &&
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
