namespace WitsmlExplorer.Api.Models
{
    public enum JobType
    {
        CopyLog = 1,
        CopyLogData,
        CopyTrajectory,
        CopyTubular,
        TrimLogObject,
        ModifyLogObject,
        DeleteMessageObjects,
        ModifyMessageObject,
        DeleteCurveValues,
        DeleteLogObjects,
        DeleteMnemonics,
        DeleteTrajectory,
        DeleteTubular,
        DeleteWell,
        DeleteWellbore,
        DeleteRisk,
        DeleteMudLog,
        RenameMnemonic,
        ModifyTubular,
        ModifyWell,
        ModifyWellbore,
        ModifyMudLog,
        CreateLogObject,
        CreateWell,
        CreateWellbore,
        CreateRisk,
        CreateMudLog,
        BatchModifyWell,
        ImportLogData
    }
}
