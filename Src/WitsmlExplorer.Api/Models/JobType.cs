namespace WitsmlExplorer.Api.Models
{
    public enum JobType
    {
        CopyBhaRun,
        CopyLog = 1,
        CopyLogData,
        CopyTrajectory,
        CopyTubular,
        CopyTubularComponents,
        ModifyBhaRun,
        TrimLogObject,
        ModifyLogObject,
        DeleteMessageObjects,
        ModifyMessageObject,
        DeleteBhaRuns,
        DeleteCurveValues,
        DeleteLogObjects,
        DeleteMnemonics,
        DeleteTrajectory,
        DeleteTrajectoryStations,
        DeleteTubular,
        DeleteTubularComponents,
        DeleteWbGeometrys,
        DeleteWell,
        DeleteWellbore,
        DeleteRisks,
        DeleteMudLog,
        RenameMnemonic,
        ModifyTrajectoryStation,
        ModifyTubular,
        ModifyTubularComponent,
        ModifyWbGeometry,
        ModifyWell,
        ModifyWellbore,
        ModifyMudLog,
        ModifyRisk,
        CreateLogObject,
        CreateWell,
        CreateWellbore,
        CreateRisk,
        CreateMudLog,
        CreateWbGeometry,
        BatchModifyWell,
        ImportLogData
    }
}
