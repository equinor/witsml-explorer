using System.ComponentModel;

namespace WitsmlExplorer.Api.Models;

public enum LogTraceState
{
    [Description("depth adjusted")]
    DepthAdjusted,

    [Description("edited")]
    Edited,

    [Description("joined")]
    Joined,

    [Description("processed")]
    Processed,

    [Description("raw")]
    Raw,

    [Description("unknown")]
    Unknown
}
