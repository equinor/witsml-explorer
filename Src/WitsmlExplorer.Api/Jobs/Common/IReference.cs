namespace WitsmlExplorer.Api.Jobs.Common
{
    public interface IReference
    {
        string Description();
        string GetWellName();
        string GetWellboreName();
        string GetObjectName();
    }
}
