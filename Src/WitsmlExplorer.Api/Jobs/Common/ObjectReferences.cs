using System;
using System.Text;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class ObjectReferences : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string[] ObjectUids { get; set; }
        public string WellName { get; set; }
        public string WellboreName { get; set; }
        public string[] Names { get; set; }
        public EntityType ObjectType { get; set; }

        public string Description()
        {
            StringBuilder desc = new();
            desc.Append($"ObjectType: {ObjectType}; ");
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"ObjectUids: {string.Join(", ", ObjectUids)}; ");
            return desc.ToString();
        }

        public void Verify()
        {
            if (ObjectUids == null || ObjectUids.Length == 0)
            {
                throw new ArgumentException("A minimum of one object UID is required");
            }

            if (string.IsNullOrEmpty(WellUid))
            {
                throw new ArgumentException("WellUid is required");
            }

            if (string.IsNullOrEmpty(WellboreUid))
            {
                throw new ArgumentException("WellboreUid is required");
            }
        }

        public string GetObjectName()
        {
            return string.Join(", ", Names);
        }

        public string GetWellboreName()
        {
            return WellboreName;
        }

        public string GetWellName()
        {
            return WellName;
        }
    }
}
