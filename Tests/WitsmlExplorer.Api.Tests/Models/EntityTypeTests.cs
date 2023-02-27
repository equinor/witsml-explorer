using System.Collections.Generic;

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
    }
}
