using System;

namespace WitsmlExplorer.Api.Models
{
    public class Rig
    {
        public string AirGap { get; internal set; }
        public DateTime? DateTimeCreation { get; internal set; }
        public DateTime DateTimeEndOperating { get; internal set; }
        public DateTime? DateTimeLastChange { get; internal set; }
        public DateTime DateTimeStartOperating { get; internal set; }
        public string ItemState { get; internal set; }
        public string Name { get; internal set; }
        public string Owner { get; internal set; }
        public string TypeRig { get; internal set; }
        public string Uid { get; internal set; }
        public string WellboreName { get; internal set; }
        public string WellboreUid { get; internal set; }
        public string WellName { get; internal set; }
        public string WellUid { get; internal set; }
    }
}
