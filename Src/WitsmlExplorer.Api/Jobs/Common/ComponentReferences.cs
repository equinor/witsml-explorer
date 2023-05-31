using System;
using System.Text;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class ComponentReferences : IReference
    {
        public ObjectReference Parent { get; set; }
        public ComponentType ComponentType { get; set; }
        public string[] ComponentUids { get; set; } = Array.Empty<string>();

        public string Description()
        {
            StringBuilder desc = new();
            desc.Append(Parent.Description());
            desc.Append($"ComponentType: {ComponentType}; ");
            desc.Append($"ComponentUids: {string.Join(", ", ComponentUids)}; ");
            return desc.ToString();
        }

        public void Verify()
        {
            if (ComponentUids == null || ComponentUids.Length == 0)
            {
                throw new ArgumentException("A minimum of one component UID is required");
            }
            if (Parent == null)
            {
                throw new ArgumentException("Parent is required");
            }
            Parent.Verify();
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
