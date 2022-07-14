namespace WitsmlExplorer.Api.Models
{
    public enum JobType
    {
        CopyLog = 1,
        CopyLogData,
        CopyTrajectory,
        CopyTubular,
        CopyTubularComponents,
        TrimLogObject,
        ModifyLogObject,
        DeleteMessageObjects,
        ModifyMessageObject,
        DeleteCurveValues,
        DeleteLogObjects,
        DeleteMnemonics,
        DeleteTrajectory,
        DeleteTrajectoryStations,

        DeleteTubular,
        DeleteTubularComponents,
        DeleteWell,
        DeleteWellbore,
        DeleteRisk,
        DeleteMudLog,
        RenameMnemonic,
        ModifyTrajectoryStation,
        ModifyTubular,
        ModifyTubularComponent,
        ModifyWell,
        ModifyWellbore,
        ModifyMudLog,
        ModifyRisk,
        CreateLogObject,
        CreateWell,
        CreateWellbore,
        CreateRisk,
        CreateMudLog,
        BatchModifyWell,
        ImportLogData
    }
}
