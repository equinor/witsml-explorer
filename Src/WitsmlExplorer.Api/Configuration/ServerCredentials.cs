namespace WitsmlExplorer.Api.Configuration
{
    public class ServerCredentials : ICredentials
    {
        internal ServerCredentials() { }

        public ServerCredentials(string host, string userid, string password)
        {
            Host = host;
            UserId = userid;
            Password = password;
        }
        public ServerCredentials(string host, ICredentials creds)
        {
            Host = host;
            UserId = creds.UserId;
            Password = creds.Password;
        }
        public string Host { get; init; }
        public string UserId { get; init; }
        public string Password { get; init; }
        public bool IsNullOrEmpty()
        {
            return string.IsNullOrEmpty(Host) || string.IsNullOrEmpty(UserId) || string.IsNullOrEmpty(Password);
        }

    }
}
