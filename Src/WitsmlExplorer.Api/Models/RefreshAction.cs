using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum RefreshType
    {
        Add,
        Remove,
        Update,
        BatchUpdate
    }

    public abstract class RefreshAction
    {
        protected RefreshAction(Uri serverUrl, RefreshType refreshType)
        {
            ServerUrl = serverUrl;
            RefreshType = refreshType;
        }

        public abstract EntityType EntityType { get; }
        public Uri ServerUrl { get; }
        public RefreshType RefreshType { get; }
    }

    public class RefreshWell : RefreshAction
    {
        public override EntityType EntityType => EntityType.Well;
        public string WellUid { get; }

        public RefreshWell(Uri serverUrl, string wellUid, RefreshType refreshType)
            : base(serverUrl, refreshType)
        {
            WellUid = wellUid;
        }
    }

    public class RefreshWells : RefreshAction
    {
        public override EntityType EntityType => EntityType.Well;
        public string[] WellUids { get; }

        public RefreshWells(Uri serverUrl, string[] wellUids, RefreshType refreshType)
            : base(serverUrl, refreshType)
        {
            WellUids = wellUids;
        }
    }

    public class RefreshWellbore : RefreshAction
    {
        public override EntityType EntityType => EntityType.Wellbore;
        public string WellUid { get; }
        public string WellboreUid { get; }

        public RefreshWellbore(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType)
            : base(serverUrl, refreshType)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
        }
    }

    public class RefreshObjects : RefreshAction
    {
        private readonly EntityType _entityType;
        public override EntityType EntityType => _entityType;
        public string WellUid { get; }
        public string WellboreUid { get; }
        public string ObjectUid { get; }

        public RefreshObjects(Uri serverUrl, string wellUid, string wellboreUid, EntityType entityType, string objectUid = null)
            : base(serverUrl, RefreshType.Update)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            _entityType = entityType;
            ObjectUid = objectUid;
        }
    }

    public class BatchRefreshObjects : RefreshAction
    {
        private readonly EntityType _entityType;
        public override EntityType EntityType => _entityType;
        public List<ObjectOnWellbore> Objects { get; }

        public BatchRefreshObjects(Uri serverUrl, EntityType entityType, List<ObjectOnWellbore> objects)
            : base(serverUrl, RefreshType.BatchUpdate)
        {
            _entityType = entityType;
            Objects = objects;
        }
    }
}
