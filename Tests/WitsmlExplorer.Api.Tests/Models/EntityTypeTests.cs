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
            Dictionary<EntityType, string> strings = EntityTypeHelper.EntityTypeToPluralLowercase();
            Assert.Equal("bharuns", strings[EntityType.BhaRun]);
            Assert.Equal("logs", strings[EntityType.Log]);
            Assert.Equal("messages", strings[EntityType.Message]);
            Assert.Equal("mudlogs", strings[EntityType.MudLog]);
            Assert.Equal("rigs", strings[EntityType.Rig]);
            Assert.Equal("risks", strings[EntityType.Risk]);
            Assert.Equal("trajectories", strings[EntityType.Trajectory]);
            Assert.Equal("tubulars", strings[EntityType.Tubular]);
            Assert.Equal("wbgeometries", strings[EntityType.WbGeometry]);
        }

        [Fact]
        public void EntityTypeToObjectOnWellbore_GetAllWellboreObjects_CorrectType()
        {
            Assert.IsType<WitsmlBhaRun>(EntityTypeHelper.EntityTypeToObjectOnWellbore(EntityType.BhaRun));
            Assert.IsType<WitsmlLog>(EntityTypeHelper.EntityTypeToObjectOnWellbore(EntityType.Log));
            Assert.IsType<WitsmlMessage>(EntityTypeHelper.EntityTypeToObjectOnWellbore(EntityType.Message));
            Assert.IsType<WitsmlMudLog>(EntityTypeHelper.EntityTypeToObjectOnWellbore(EntityType.MudLog));
            Assert.IsType<WitsmlRig>(EntityTypeHelper.EntityTypeToObjectOnWellbore(EntityType.Rig));
            Assert.IsType<WitsmlRisk>(EntityTypeHelper.EntityTypeToObjectOnWellbore(EntityType.Risk));
            Assert.IsType<WitsmlTrajectory>(EntityTypeHelper.EntityTypeToObjectOnWellbore(EntityType.Trajectory));
            Assert.IsType<WitsmlTubular>(EntityTypeHelper.EntityTypeToObjectOnWellbore(EntityType.Tubular));
            Assert.IsType<WitsmlWbGeometry>(EntityTypeHelper.EntityTypeToObjectOnWellbore(EntityType.WbGeometry));
        }
    }
}
