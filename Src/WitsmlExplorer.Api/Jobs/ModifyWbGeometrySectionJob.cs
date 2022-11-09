using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyWbGeometrySectionJob : Job
    {
        public ObjectReference WbGeometryReference { get; init; }
        public WbGeometrySection WbGeometrySection { get; init; }

        public override string Description()
        {
            return $"ToModify - {WbGeometryReference.Description()} WbGeometrySectionUid: {WbGeometrySection.Uid};";
        }

        public override string GetObjectName()
        {
            return WbGeometryReference.Name;
        }

        public override string GetWellboreName()
        {
            return WbGeometryReference.WellboreName;
        }

        public override string GetWellName()
        {
            return WbGeometryReference.WellName;
        }
    }
}
