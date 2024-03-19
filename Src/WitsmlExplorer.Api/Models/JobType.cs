using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum JobType
    {
        CopyComponents = 1,
        CopyLog,
        CopyLogData,
        CopyObjects,
        CopyWell,
        CopyWellbore,
        CopyWithParent,
        TrimLogObject,
        DeleteComponents,
        DeleteCurveValues,
        DeleteObjects,
        DeleteWell,
        DeleteWellbore,
        ModifyLogCurveInfo,
        DeleteEmptyMnemonics,
        ModifyObjectOnWellbore,
        BatchModifyObjectsOnWellbore,
        BatchModifyObjectsOnSearch,
        ModifyGeologyInterval,
        ModifyTrajectoryStation,
        ModifyTubularComponent,
        ModifyWbGeometrySection,
        ModifyWell,
        ModifyWellbore,
        CreateLogObject,
        CreateWell,
        CreateWellbore,
        CreateRisk,
        CreateMudLog,
        CreateRig,
        CreateTrajectory,
        CreateWbGeometry,
        BatchModifyWell,
        ImportLogData,
        ReplaceComponents,
        ReplaceObjects,
        CheckLogHeader,
        MissingData,
        AnalyzeGaps,
        SpliceLogs,
        CompareLogData,
        CountLogDataRows,
        BatchModifyLogCurveInfo,
        DownloadAllLogData
    }
}
