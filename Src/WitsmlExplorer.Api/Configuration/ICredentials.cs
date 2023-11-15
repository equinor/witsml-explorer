namespace WitsmlExplorer.Api.Configuration
{
    public interface ICredentials
    {
        internal string UserId { get; }
        internal string Password { get; }
        public bool IsNullOrEmpty();
    }
}
