using System.Collections.Generic;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs.Common;

public class MixedObjectsReferences : IReference
{
    public WellboreReference WellboreReference { get; set; }
    public List<SelectableObjectOnWellbore> SelectedObjects { get; set; }
    public string Description()
    {
        return "Objects on wellbore";
    }

    public string GetWellName()
    {
        return WellboreReference.WellName;
    }

    public string GetWellboreName()
    {
        return WellboreReference.WellboreName;
    }

    public string GetObjectName()
    {
        return string.Empty;
    }
}
