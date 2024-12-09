using System.Collections.Generic;

using Witsml.Data;
using Witsml.Data.MudLog;
using Witsml.Data.Rig;
using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Models;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Models
{
    public class EntityTypeTests
    {
        [Fact]
        public void EntityTypeToPluralLowercase_Get_CorrectResult()
        {
            Dictionary<EntityType, string> strings = EntityTypeHelper.ToPluralLowercase();
            Assert.Equal("bharuns", strings[EntityType.BhaRun]);
            Assert.Equal("logs", strings[EntityType.Log]);
            Assert.Equal("messages", strings[EntityType.Message]);
            Assert.Equal("mudlogs", strings[EntityType.MudLog]);
            Assert.Equal("rigs", strings[EntityType.Rig]);
            Assert.Equal("risks", strings[EntityType.Risk]);
            Assert.Equal("trajectories", strings[EntityType.Trajectory]);
            Assert.Equal("tubulars", strings[EntityType.Tubular]);
            Assert.Equal("wbgeometries", strings[EntityType.WbGeometry]);
            Assert.Equal("attachments", strings[EntityType.Attachment]);
        }

        [Fact]
        public void EntityTypeToObjectOnWellbore_GetAllWellboreObjects_CorrectType()
        {
            Assert.IsType<WitsmlBhaRun>(EntityTypeHelper.ToObjectOnWellbore(EntityType.BhaRun));
            Assert.IsType<WitsmlLog>(EntityTypeHelper.ToObjectOnWellbore(EntityType.Log));
            Assert.IsType<WitsmlMessage>(EntityTypeHelper.ToObjectOnWellbore(EntityType.Message));
            Assert.IsType<WitsmlMudLog>(EntityTypeHelper.ToObjectOnWellbore(EntityType.MudLog));
            Assert.IsType<WitsmlRig>(EntityTypeHelper.ToObjectOnWellbore(EntityType.Rig));
            Assert.IsType<WitsmlRisk>(EntityTypeHelper.ToObjectOnWellbore(EntityType.Risk));
            Assert.IsType<WitsmlTrajectory>(EntityTypeHelper.ToObjectOnWellbore(EntityType.Trajectory));
            Assert.IsType<WitsmlTubular>(EntityTypeHelper.ToObjectOnWellbore(EntityType.Tubular));
            Assert.IsType<WitsmlWbGeometry>(EntityTypeHelper.ToObjectOnWellbore(EntityType.WbGeometry));
            Assert.IsType<WitsmlAttachment>(EntityTypeHelper.ToObjectOnWellbore(EntityType.Attachment));
        }

        [Fact]
        public void EntityTypeToObjectList_GetAllWellboreObjectLists_CorrectType()
        {
            Assert.IsType<WitsmlBhaRuns>(EntityTypeHelper.ToObjectList(EntityType.BhaRun));
            Assert.IsType<WitsmlLogs>(EntityTypeHelper.ToObjectList(EntityType.Log));
            Assert.IsType<WitsmlMessages>(EntityTypeHelper.ToObjectList(EntityType.Message));
            Assert.IsType<WitsmlMudLogs>(EntityTypeHelper.ToObjectList(EntityType.MudLog));
            Assert.IsType<WitsmlRigs>(EntityTypeHelper.ToObjectList(EntityType.Rig));
            Assert.IsType<WitsmlRisks>(EntityTypeHelper.ToObjectList(EntityType.Risk));
            Assert.IsType<WitsmlTrajectories>(EntityTypeHelper.ToObjectList(EntityType.Trajectory));
            Assert.IsType<WitsmlTubulars>(EntityTypeHelper.ToObjectList(EntityType.Tubular));
            Assert.IsType<WitsmlWbGeometrys>(EntityTypeHelper.ToObjectList(EntityType.WbGeometry));
            Assert.IsType<WitsmlAttachments>(EntityTypeHelper.ToObjectList(EntityType.Attachment));
        }
    }
}
