namespace WitsmlExplorer.Api.Models
{
    public enum JobType
    {
        CopyLog = 1,
        CopyLogData,
        CopyTrajectory,
        TrimLogObject,
        ModifyLogObject,
        DeleteCurveValues,
        DeleteLogObjects,
        DeleteMnemonics,
        DeleteTrajectory,
        DeleteWell,
        DeleteWellbore,
        RenameMnemonic,
        ModifyWell,
        ModifyWellbore,
        CreateLogObject,
        CreateWell,
        CreateWellbore,
        BatchModifyWell,
        ImportLogData
    }
}
