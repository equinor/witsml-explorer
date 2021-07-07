namespace WitsmlExplorer.Api.Models
{
    public enum JobType
    {
        CopyLog = 1,
        CopyLogData,
        CopyTrajectory,
        TrimLogObject,
        ModifyLogObject,
        CreateMessageObject,
        DeleteCurveValues,
        DeleteLogObjects,
        DeleteMnemonics,
        DeleteTrajectory,
        DeleteWell,
        DeleteWellbore,
        DeleteRisk,
        DeleteMudLog,
        RenameMnemonic,
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
