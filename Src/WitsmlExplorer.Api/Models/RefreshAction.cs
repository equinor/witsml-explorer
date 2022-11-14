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

    public class RefreshBhaRuns : RefreshAction
    {
        public override EntityType EntityType => EntityType.BhaRuns;
        public string WellUid { get; }
        public string WellboreUid { get; }

        public RefreshType RefreshType { get; }

        public RefreshBhaRuns(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType) : base(serverUrl)
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

    public class RefreshLogObjects : RefreshAction
    {
        public override EntityType EntityType => EntityType.LogObjects;
        public string WellUid { get; }
        public string WellboreUid { get; }
        public RefreshType RefreshType { get; }

        public RefreshLogObjects(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            RefreshType = refreshType;
        }
    }

    public class RefreshMessageObjects : RefreshAction
    {
        public override EntityType EntityType => EntityType.MessageObjects;
        public string WellUid { get; }
        public string WellboreUid { get; }

        public RefreshType RefreshType { get; }

        public RefreshMessageObjects(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            RefreshType = refreshType;
        }
    }
    public class RefreshRigs : RefreshAction
    {
        public override EntityType EntityType => EntityType.Rigs;
        public string WellUid { get; }
        public string WellboreUid { get; }

        public RefreshType RefreshType { get; }

        public RefreshRigs(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            RefreshType = refreshType;
        }
    }
    public class RefreshRisks : RefreshAction
    {
        public override EntityType EntityType => EntityType.Risks;
        public string WellUid { get; }
        public string WellboreUid { get; }

        public RefreshType RefreshType { get; }

        public RefreshRisks(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            RefreshType = refreshType;
        }
    }

    public class RefreshTubulars : RefreshAction
    {
        public override EntityType EntityType => EntityType.Tubular;
        public string WellUid { get; }
        public string WellboreUid { get; }
        public RefreshType RefreshType { get; }

        public RefreshTubulars(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            RefreshType = refreshType;
        }
    }

    public class RefreshTrajectory : RefreshAction
    {
        public override EntityType EntityType => EntityType.Trajectory;
        public string WellUid { get; }
        public string WellboreUid { get; }
        public string TrajectoryUid { get; }
        public RefreshType RefreshType { get; }

        public RefreshTrajectory(Uri serverUrl, string wellUid, string wellboreUid, string trajectoryUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            TrajectoryUid = trajectoryUid;
            RefreshType = refreshType;
        }
    }

    public class RefreshTrajectories : RefreshAction
    {
        public override EntityType EntityType => EntityType.Trajectories;
        public string WellUid { get; }
        public string WellboreUid { get; }
        public RefreshType RefreshType { get; }

        public RefreshTrajectories(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            RefreshType = refreshType;
        }
    }

    public class RefreshWbGeometry : RefreshAction
    {
        public override EntityType EntityType => EntityType.WbGeometry;
        public string WellUid { get; }
        public string WellboreUid { get; }
        public string WbGeometryUid { get; }

        public RefreshType RefreshType { get; }

        public RefreshWbGeometry(Uri serverUrl, string wellUid, string wellboreUid, string wbGeometryUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            WbGeometryUid = wbGeometryUid;
            RefreshType = refreshType;
        }
    }

    public class RefreshWbGeometryObjects : RefreshAction
    {
        public override EntityType EntityType => EntityType.WbGeometryObjects;
        public string WellUid { get; }
        public string WellboreUid { get; }

        public RefreshType RefreshType { get; }

        public RefreshWbGeometryObjects(Uri serverUrl, string wellUid, string wellboreUid, RefreshType refreshType) : base(serverUrl)
        {
            WellUid = wellUid;
            WellboreUid = wellboreUid;
            RefreshType = refreshType;
        }
    }
}
