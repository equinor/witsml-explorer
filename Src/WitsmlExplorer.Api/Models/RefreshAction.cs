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
        protected RefreshAction(Uri serverUrl, RefreshType refreshType, JobType originJobType)
        {
            ServerUrl = serverUrl;
            RefreshType = refreshType;
            OriginJobType = originJobType;
        }

        public abstract EntityType EntityType { get; }
        public Uri ServerUrl { get; }
        public RefreshType RefreshType { get; }
        public JobType OriginJobType { get; }
    }

    public class RefreshWell : RefreshAction
    {
        public override EntityType EntityType => EntityType.Well;
        public string WellUid { get; }

        public RefreshWell(Uri serverUrl, string wellUid, RefreshType refreshType, JobType originJobType)
            : base(serverUrl, refreshType, originJobType)
        {
            WellUid = wellUid;
        }
    }

    public class RefreshWells : RefreshAction
    {
        public override EntityType EntityType => EntityType.Well;
        public string[] WellUids { get; }

        public RefreshWells(Uri serverUrl, string[] wellUids, RefreshType refreshType, JobType originJobType)
            : base(serverUrl, refreshType, originJobType)
        {
            WellUids = wellUids;
        }
    }

    public class RefreshWellbore : RefreshAction
    {
        public override EntityType EntityType => EntityType.Wellbore;
        public string WellUid { get; }
        public string WellboreUid { get; }

        public RefreshWellbore(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType, JobType originJobType)
            : base(serverUrl, refreshType, originJobType)
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

        public RefreshObjects(Uri serverUrl, string wellUid, string wellboreUid, EntityType entityType, JobType originJobType, string objectUid = null)
            : base(serverUrl, RefreshType.Update, originJobType)
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

        public BatchRefreshObjects(Uri serverUrl, EntityType entityType, JobType originJobType, List<ObjectOnWellbore> objects)
            : base(serverUrl, RefreshType.BatchUpdate, originJobType)
        {
            _entityType = entityType;
            Objects = objects;
        }
    }
}
