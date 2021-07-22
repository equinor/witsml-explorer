namespace WitsmlExplorer.Api.Models
{
    public enum JobType
    {
        CopyLog = 1,
        CopyLogData,
        CopyTrajectory,
        TrimLogObject,
        ModifyLogObject,
        DeleteMessageObjects,
        ModifyMessageObject,
        DeleteCurveValues,
        DeleteLogObjects,
        DeleteMnemonics,
        DeleteTrajectory,
        DeleteWell,
        DeleteWellbore,
        DeleteRisk,
        RenameMnemonic,
        ModifyWell,
        ModifyWellbore,
        CreateLogObject,
        CreateWell,
        CreateWellbore,
        CreateRisk,
        BatchModifyWell,
        ImportLogData
    }
}
