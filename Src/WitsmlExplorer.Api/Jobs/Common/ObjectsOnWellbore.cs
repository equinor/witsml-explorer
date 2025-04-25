using System.Collections.Generic;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs.Common;

public class ObjectsOnWellbore : IReference
{
    public WellboreReference WellboreReference { get; set; }
    public List<ObjectOnWellboreForSelection> SelectedObjects { get; set; }
    public string Description()
    {
        throw new System.NotImplementedException();
    }

    public string GetWellName()
    {
        throw new System.NotImplementedException();
    }

    public string GetWellboreName()
    {
        throw new System.NotImplementedException();
    }

    public string GetObjectName()
    {
        throw new System.NotImplementedException();
    }
}
