namespace WitsmlExplorer.Api.Jobs.Common.Interfaces;

/// <summary>
/// Interface of common wellbore properties. 
/// </summary>
public interface IObjectReference
{
    public string Uid { get; }
    public string WellUid { get; }
    public string WellboreUid { get; }
    public string Name { get; }
    public string WellName { get; }
    public string WellboreName { get; }
}
