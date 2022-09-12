namespace WitsmlExplorer.Api.Configuration
{
    public interface ICopyCredentials
    {
        internal ServerCredentials Source { get; }
        internal ServerCredentials Target { get; }

    }
}
