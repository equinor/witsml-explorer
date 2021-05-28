using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.OpenApi.Extensions;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Workers;

namespace WitsmlExplorer.Api.Services
{
    public interface IJobService
    {
        Task CreateJob(JobType jobType, Stream httpRequestBody);
    }

    public class JobService : IJobService
    {
        private readonly IHubContext<NotificationsHub> hubContext;
        private readonly ICopyLogWorker copyLogWorker;
        private readonly ICopyLogDataWorker copyLogDataWorker;
        private readonly ICopyTrajectoryWorker copyTrajectoryWorker;
        private readonly ITrimLogObjectWorker trimLogObjectWorker;
        private readonly IModifyLogObjectWorker modifyLogObjectWorker;
        private readonly IDeleteCurveValuesWorker deleteCurveValuesWorker;
        private readonly IDeleteLogObjectsWorker deleteLogObjectsWorker;
        private readonly IDeleteMnemonicsWorker deleteMnemonicsWorker;
        private readonly IDeleteWellWorker deleteWellWorker;
        private readonly IDeleteWellboreWorker deleteWellboreWorker;
        private readonly IDeleteTrajectoryWorker deleteTrajectoryWorker;
        private readonly IRenameMnemonicWorker renameMnemonicWorker;
        private readonly IModifyWellWorker modifyWellWorker;
        private readonly IModifyWellboreWorker modifyWellboreWorker;
        private readonly ICreateLogWorker createLogWorker;
        private readonly ICreateWellWorker createWellWorker;
        private readonly ICreateWellboreWorker createWellboreWorker;
        private readonly IBatchModifyWellWorker batchModifyWellWorker;

        private readonly IModifyMudLogWorker modifyMudLogWorker;
        private readonly IDeleteLogObjectWorker deleteLogObjectWorker;
        private readonly IDeleteRiskWorker deleteRiskWorker;
        private readonly IDeleteFormationMarkerWorker deleteFormationMarkerWorker;
        private readonly ICreateTrajectoryWorker createTrajectoryWorker;
        private readonly ICreateLogObjectWorker createLogObjectWorker;
        private readonly ICreateMudLogWorker createMudLogWorker;
        private readonly ICreateRiskWorker createRiskWorker;
        private readonly ICreateFormationMarkerWorker createFormationMarkerWorker;


        
        public JobService(
            IHubContext<NotificationsHub> hubContext,
            ICopyLogWorker copyLogWorker,
            ICopyLogDataWorker copyLogDataWorker,
            ICopyTrajectoryWorker copyTrajectoryWorker,
            ITrimLogObjectWorker trimLogObjectWorker,
            IModifyLogObjectWorker modifyLogObjectWorker,
            IDeleteCurveValuesWorker deleteCurveValuesWorker,
            IDeleteLogObjectsWorker deleteLogObjectsWorker,
            IDeleteMnemonicsWorker deleteMnemonicsWorker,
            IDeleteTrajectoryWorker deleteTrajectoryWorker,
            IDeleteWellWorker deleteWellWorker,
            IDeleteWellboreWorker deleteWellboreWorker,
            IRenameMnemonicWorker renameMnemonicWorker,
            IModifyWellWorker modifyWellWorker,
            IModifyWellboreWorker modifyWellboreWorker,
            ICreateLogWorker createLogWorker,
            ICreateWellWorker createWellWorker,
            ICreateWellboreWorker createWellboreWorker,
            IBatchModifyWellWorker batchModifyWellWorker,

            IModifyMudLogWorker modifyMudLogWorker,
            IDeleteLogObjectWorker deleteLogObjectWorker,
            IDeleteRiskWorker deleteRiskWorker,
            IDeleteFormationMarkerWorker deleteFormationMarkerWorker,
            ICreateTrajectoryWorker createTrajectoryWorker,
            ICreateLogObjectWorker createLogObjectWorker,
            ICreateMudLogWorker createMudLogWorker,
            ICreateRiskWorker createRiskWorker,
            ICreateFormationMarkerWorker createFormationMarkerWorker
            )
        {
            this.hubContext = hubContext;
            this.copyLogWorker = copyLogWorker;
            this.copyLogDataWorker = copyLogDataWorker;
            this.copyTrajectoryWorker = copyTrajectoryWorker;
            this.trimLogObjectWorker = trimLogObjectWorker;
            this.modifyLogObjectWorker = modifyLogObjectWorker;
            this.deleteCurveValuesWorker = deleteCurveValuesWorker;
            this.deleteLogObjectsWorker = deleteLogObjectsWorker;
            this.deleteMnemonicsWorker = deleteMnemonicsWorker;
            this.deleteTrajectoryWorker = deleteTrajectoryWorker;
            this.deleteWellWorker = deleteWellWorker;
            this.deleteWellboreWorker = deleteWellboreWorker;
            this.renameMnemonicWorker = renameMnemonicWorker;
            this.modifyWellWorker = modifyWellWorker;
            this.modifyWellboreWorker = modifyWellboreWorker;
            this.createLogWorker = createLogWorker;
            this.createWellWorker = createWellWorker;
            this.createWellboreWorker = createWellboreWorker;
            this.batchModifyWellWorker = batchModifyWellWorker;

            this.modifyMudLogWorker = modifyMudLogWorker;
            this.deleteLogObjectWorker = deleteLogObjectWorker;
            this.deleteRiskWorker = deleteRiskWorker;
            this.deleteFormationMarkerWorker = deleteFormationMarkerWorker;
            this.createTrajectoryWorker = createTrajectoryWorker;
            this.createLogObjectWorker = createLogObjectWorker;
            this.createMudLogWorker = createMudLogWorker;
            this.createRiskWorker = createRiskWorker;
            this.createFormationMarkerWorker = createFormationMarkerWorker;

        }

        public async Task CreateJob(JobType jobType, Stream jobStream)
        {
            WorkerResult result;
            RefreshAction refreshAction = null;
            switch (jobType)
            {
                case JobType.CopyLog:
                    var copyLogJob = await jobStream.Deserialize<CopyLogJob>();
                    (result, refreshAction) = await copyLogWorker.Execute(copyLogJob);
                    break;
                case JobType.CopyLogData:
                    var copyLogDataJob = await jobStream.Deserialize<CopyLogDataJob>();
                    (result, refreshAction) = await copyLogDataWorker.Execute(copyLogDataJob);
                    break;
                case JobType.CopyTrajectory:
                    var copyTrajectoryJob = await jobStream.Deserialize<CopyTrajectoryJob>();
                    (result, refreshAction) = await copyTrajectoryWorker.Execute(copyTrajectoryJob);
                    break;
                case JobType.TrimLogObject:
                    var trimLogObjectJob = await jobStream.Deserialize<TrimLogDataJob>();
                    (result, refreshAction) = await trimLogObjectWorker.Execute(trimLogObjectJob);
                    break;
                case JobType.ModifyLogObject:
                    var modifyLogObjectJob = await jobStream.Deserialize<ModifyLogObjectJob>();
                    (result, refreshAction) = await modifyLogObjectWorker.Execute(modifyLogObjectJob);
                    break;
                case JobType.DeleteCurveValues:
                    var deleteCurveValuesJob = await jobStream.Deserialize<DeleteCurveValuesJob>();
                    (result, refreshAction) = await deleteCurveValuesWorker.Execute(deleteCurveValuesJob);
                    break;
                case JobType.DeleteLogObjects:
                    var deleteLogObjectsJob = await jobStream.Deserialize<DeleteLogObjectsJob>();
                    (result, refreshAction) = await deleteLogObjectsWorker.Execute(deleteLogObjectsJob);
                    break;
                case JobType.DeleteMnemonics:
                    var deleteMnemonicsJob = await jobStream.Deserialize<DeleteMnemonicsJob>();
                    (result, refreshAction) = await deleteMnemonicsWorker.Execute(deleteMnemonicsJob);
                    break;
                case JobType.DeleteWell:
                    var deleteWellJob = await jobStream.Deserialize<DeleteWellJob>();
                    (result, refreshAction) = await deleteWellWorker.Execute(deleteWellJob);
                    break;
                case JobType.DeleteWellbore:
                    var deleteWellboreJob = await jobStream.Deserialize<DeleteWellboreJob>();
                    (result, refreshAction) = await deleteWellboreWorker.Execute(deleteWellboreJob);
                    break;
                case JobType.RenameMnemonic:
                    var modifyLogCurveInfoJob = await jobStream.Deserialize<RenameMnemonicJob>();
                    (result, refreshAction) = await renameMnemonicWorker.Execute(modifyLogCurveInfoJob);
                    break;
                case JobType.ModifyWell:
                    var modifyWellJob = await jobStream.Deserialize<ModifyWellJob>();
                    (result, refreshAction) = await modifyWellWorker.Execute(modifyWellJob);
                    break;
                case JobType.ModifyWellbore:
                    var modifyWellboreJob = await jobStream.Deserialize<ModifyWellboreJob>();
                    (result, refreshAction) = await modifyWellboreWorker.Execute(modifyWellboreJob);
                    break;
                case JobType.DeleteTrajectory:
                    var deleteTrajectoryJob = await jobStream.Deserialize<DeleteTrajectoryJob>();
                    result = await deleteTrajectoryWorker.Execute(deleteTrajectoryJob);
                    break;
                case JobType.CreateLogObject:
                    var createLogObject = await jobStream.Deserialize<CreateLogJob>();
                    (result, refreshAction) = await createLogWorker.Execute(createLogObject);
                    break;
                case JobType.CreateWell:
                    var createWellJob = await jobStream.Deserialize<CreateWellJob>();
                    (result, refreshAction) = await createWellWorker.Execute(createWellJob);
                    break;
                case JobType.CreateWellbore:
                    var createWellboreJob = await jobStream.Deserialize<CreateWellboreJob>();
                    (result, refreshAction) = await createWellboreWorker.Execute(createWellboreJob);
                    break;
                case JobType.BatchModifyWell:
                    var batchModifyWellJob = await jobStream.Deserialize<BatchModifyWellJob>();
                    (result, refreshAction) = await batchModifyWellWorker.Execute(batchModifyWellJob);
                    break;
                case JobType.ModifyMudLog:
                    var modifyMudLogJob = await jobStream.Deserialize<ModifyMudLogJob>();
                    result = await modifyMudLogWorker.Execute(modifyMudLogJob);
                    break;
                case JobType.DeleteLogObject:
                    var deleteLogObjectJob = await jobStream.Deserialize<DeleteLogObjectJob>();
                    (result, refreshAction) = await deleteLogObjectWorker.Execute(deleteLogObjectJob);
                    break;
                case JobType.DeleteRisk:
                    var deleteRiskJob = await jobStream.Deserialize<DeleteRiskJob>();
                    result = await deleteRiskWorker.Execute(deleteRiskJob);
                    break;
                case JobType.CreateFormationMarker:
                    var createFormationMarkerJob = await jobStream.Deserialize<CreateFormationMarkerJob>();
                    (result, refreshAction) = await createFormationMarkerWorker.Execute(createFormationMarkerJob);
                    break;
                case JobType.DeleteFormationMarker:
                    var deleteFormationMarkerJob = await jobStream.Deserialize<DeleteFormationMarkerJob>();
                    result = await deleteFormationMarkerWorker.Execute(deleteFormationMarkerJob);
                    break;
                case JobType.CreateTrajectory:
                    var createTrajectoryJob = await jobStream.Deserialize<CreateTrajectoryJob>();
                    (result, refreshAction) = await createTrajectoryWorker.Execute(createTrajectoryJob);
                    break;
                case JobType.CreateMudLog:
                    var createMudLogJob = await jobStream.Deserialize<CreateMudLogJob>();
                    (result, refreshAction) = await createMudLogWorker.Execute(createMudLogJob);
                    break;
                case JobType.CreateRisk:
                    var createRiskJob = await jobStream.Deserialize<CreateRiskJob>();
                    (result, refreshAction) = await createRiskWorker.Execute(createRiskJob);
                    break;
                
                default:
                    throw new ArgumentOutOfRangeException(nameof(jobType), jobType, $"No worker setup to execute {jobType.GetDisplayName()}");
            }

            if (hubContext != null)
            {
                await hubContext.Clients.All.SendCoreAsync("jobFinished", new object[] {result});

                if (refreshAction != null)
                    await hubContext.Clients.All.SendCoreAsync("refresh", new object[] {refreshAction});
            }
        }
    }
}
