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
        private readonly IWorker<CopyLogJob> copyLogWorker;
        private readonly IWorker<CopyLogDataJob> copyLogDataWorker;
        private readonly IWorker<CopyTrajectoryJob> copyTrajectoryWorker;
        private readonly IWorker<TrimLogDataJob> trimLogObjectWorker;
        private readonly IWorker<ModifyLogObjectJob> modifyLogObjectWorker;
        private readonly ICreateMessageObjectWorker createMessageObjectWorker;
        private readonly IDeleteCurveValuesWorker deleteCurveValuesWorker;
        private readonly IDeleteLogObjectsWorker deleteLogObjectsWorker;
        private readonly IDeleteMnemonicsWorker deleteMnemonicsWorker;
        private readonly IDeleteWellWorker deleteWellWorker;
        private readonly IDeleteWellboreWorker deleteWellboreWorker;
        private readonly IDeleteTrajectoryWorker deleteTrajectoryWorker;
        private readonly IRenameMnemonicWorker renameMnemonicWorker;
        private readonly IWorker<ModifyWellJob> modifyWellWorker;
        private readonly IWorker<ModifyWellboreJob> modifyWellboreWorker;
        private readonly IWorker<CreateLogJob> createLogWorker;
        private readonly IWorker<CreateWellJob> createWellWorker;
        private readonly IWorker<CreateWellboreJob> createWellboreWorker;
        private readonly IWorker<BatchModifyWellJob> batchModifyWellWorker;

        public JobService(
            IHubContext<NotificationsHub> hubContext,
            IWorker<CopyLogJob> copyLogWorker,
            IWorker<CopyLogDataJob> copyLogDataWorker,
            IWorker<CopyTrajectoryJob> copyTrajectoryWorker,
            IWorker<TrimLogDataJob> trimLogObjectWorker,
            IWorker<ModifyLogObjectJob> modifyLogObjectWorker,
            IDeleteCurveValuesWorker deleteCurveValuesWorker,
            IDeleteLogObjectsWorker deleteLogObjectsWorker,
            IDeleteMnemonicsWorker deleteMnemonicsWorker,
            IDeleteTrajectoryWorker deleteTrajectoryWorker,
            IDeleteWellWorker deleteWellWorker,
            IDeleteWellboreWorker deleteWellboreWorker,
            IRenameMnemonicWorker renameMnemonicWorker,
            IWorker<ModifyWellJob> modifyWellWorker,
            IWorker<ModifyWellboreJob> modifyWellboreWorker,
            IWorker<CreateLogJob> createLogWorker,
            IWorker<CreateWellJob> createWellWorker,
            IWorker<CreateWellboreJob> createWellboreWorker,
            IWorker<BatchModifyWellJob> batchModifyWellWorker,
            ICreateMessageObjectWorker createMessageObjectWorker)
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
            this.createMessageObjectWorker = createMessageObjectWorker;
            this.createWellWorker = createWellWorker;
            this.createWellboreWorker = createWellboreWorker;
            this.batchModifyWellWorker = batchModifyWellWorker;
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
                case JobType.CreateMessageObject:
                    var createMessageObjectJob = await jobStream.Deserialize<CreateMessageObjectJob>();
                    (result, refreshAction) = await createMessageObjectWorker.Execute(createMessageObjectJob);
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
                default:
                    throw new ArgumentOutOfRangeException(nameof(jobType), jobType, $"No worker setup to execute {jobType.GetDisplayName()}");
            }

            if (hubContext != null)
            {
                await hubContext.Clients.All.SendCoreAsync("jobFinished", new object[] { result });

                if (refreshAction != null)
                    await hubContext.Clients.All.SendCoreAsync("refresh", new object[] { refreshAction });
            }
        }
    }
}
