using System;
using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class ComponentReferences : IReference
    {
        public ObjectReference Parent { get; set; }
        public string[] ComponentUids { get; set; } = Array.Empty<string>();

        public string Description()
        {
            StringBuilder desc = new();
            desc.Append(Parent.Description());
            desc.Append($"ComponentUids: {string.Join(", ", ComponentUids)}; ");
            return desc.ToString();
        }

        public string GetObjectName()
        {
            return Parent.Name;
        }

        public string GetWellboreName()
        {
            return Parent.WellboreName;
        }

        public string GetWellName()
        {
            return Parent.WellName;
        }
    }
}
