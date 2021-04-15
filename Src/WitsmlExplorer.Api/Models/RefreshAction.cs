using System;
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
        protected RefreshAction(Uri serverUrl)
        {
            ServerUrl = serverUrl;
        }

        public abstract EntityType EntityType { get; }
        public Uri ServerUrl { get; }
    }

    public class RefreshWell : RefreshAction
    {
        public override EntityType EntityType => EntityType.Well;
        public string WellUid { get; }
        public RefreshType RefreshType { get; }

        public RefreshWell(Uri serverUrl, string wellUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            RefreshType = refreshType;
        }
    }

    public class RefreshWells : RefreshAction
    {
        public override EntityType EntityType => EntityType.Well;
        public string[] WellUids { get; }
        public RefreshType RefreshType { get; }

        public RefreshWells(Uri serverUrl, string[] wellUids, RefreshType refreshType) : base(serverUrl)
        {
            WellUids = wellUids;
            RefreshType = refreshType;
        }
    }

    public class RefreshWellbore : RefreshAction
    {
        public override EntityType EntityType => EntityType.Wellbore;
        public string WellUid { get; }
        public string WellboreUid { get; }
        public RefreshType RefreshType { get; }

        public RefreshWellbore(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            RefreshType = refreshType;
        }
    }

    public class RefreshLogObject : RefreshAction
    {
        public override EntityType EntityType => EntityType.LogObject;
        public string WellUid { get; }
        public string WellboreUid { get; }
        public string LogObjectUid { get; }

        public RefreshType RefreshType { get; }

        public RefreshLogObject(Uri serverUrl, string wellUid, string wellboreUid, string logObjectUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            LogObjectUid = logObjectUid;
            RefreshType = refreshType;
        }
    }
}
