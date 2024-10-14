using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyComponentsWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyComponentsJob job, CancellationToken? cancellationToken = null);
    }

    public class CopyComponentsWorker : BaseWorker<CopyComponentsJob>, IWorker, ICopyComponentsWorker
    {

        public JobType JobType => JobType.CopyComponents;

        private CopyComponentsJob _job;
        private Uri _targetHostname;
        private Uri _sourceHostname;
        private ComponentType _componentType;
        private string _errorMessage;
        private readonly ICopyLogDataWorker _copyLogDataWorker;

        public CopyComponentsWorker(ILogger<CopyComponentsJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyLogDataWorker copyLogDataWorker) : base(witsmlClientProvider, logger)
        {
            _copyLogDataWorker = copyLogDataWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyComponentsJob job, CancellationToken? cancellationToken = null)
        {
            if (job.Source.ComponentType == ComponentType.Mnemonic)
            {
                return await _copyLogDataWorker.Execute(new CopyLogDataJob()
                {
                    Source = job.Source,
                    Target = job.Target,
                    ProgressReporter = new Progress<double>(progress =>
                    {
                        job.ProgressReporter?.Report(progress);
                        if (job.JobInfo != null) job.JobInfo.Progress = progress;
                    })
                }, cancellationToken);
            }

            _job = job;
            IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();
            _targetHostname = targetClient.GetServerHostname();
            IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
            _sourceHostname = sourceClient.GetServerHostname();
            _componentType = job.Source.ComponentType;
            _errorMessage = $"Failed to copy {_componentType.ToPluralLowercase()}.";

            string errorReason = await VerifyTarget();
            if (errorReason != null)
            {
                return LogErrorAndReturnResult(errorReason);
            }

            string[] toCopyUids = job.Source.ComponentUids;
            IWitsmlObjectList sourceQuery = ObjectQueries.GetWitsmlObjectByReference(job.Source.Parent, _componentType.ToParentType());
            ObjectQueries.SetComponents(sourceQuery.Objects?.FirstOrDefault(), _componentType, toCopyUids);
            IWitsmlObjectList source = await GetSourceWitsmlClientOrThrow().GetFromStoreNullableAsync(sourceQuery, new OptionsIn(ReturnElements.All));
            if (source == null)
            {
                string reason = $"Unable to fetch {_componentType.ToParentType()} with uid {sourceQuery.Objects?.FirstOrDefault()?.Uid}.";
                return LogErrorAndReturnResult(reason);
            }

            IEnumerable<string> sourceComponentUids = ObjectQueries.GetComponentUids(source.Objects?.FirstOrDefault(), _componentType);
            IEnumerable<string> missingUids = toCopyUids.Except(sourceComponentUids);
            if (missingUids.Any())
            {
                string reason = $"Could not retrieve some {_componentType.ToPluralLowercase()}, missing uids: {string.Join(", ", missingUids)}.";
                return LogErrorAndReturnResult(reason);
            }
            cancellationToken?.ThrowIfCancellationRequested();
            WitsmlObjectOnWellbore updateTargetQuery = ObjectQueries.CopyComponents(source.Objects?.FirstOrDefault(), _componentType, job.Target, toCopyUids);
            QueryResult copyResult = await targetClient.UpdateInStoreAsync(updateTargetQuery.AsItemInWitsmlList());
            if (!copyResult.IsSuccessful)
            {
                return LogErrorAndReturnResult(copyResult.Reason);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshObjects refreshAction = new(_targetHostname, job.Target.WellUid, job.Target.WellboreUid, _componentType.ToParentType(), job.Target.Uid);
            WorkerResult workerResult = new(_targetHostname, true, $"Components {string.Join(", ", toCopyUids)} copied to: {job.Target.Name}", sourceServerUrl: _sourceHostname);

            return (workerResult, refreshAction);
        }

        private async Task<string> VerifyTarget()
        {
            IWitsmlObjectList targetQuery = ObjectQueries.GetWitsmlObjectByReference(_job.Target, _componentType.ToParentType());
            ObjectQueries.SetComponents(targetQuery?.Objects?.FirstOrDefault(), _componentType, _job.Source.ComponentUids);
            IWitsmlObjectList target = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(targetQuery, new OptionsIn(ReturnElements.Requested));
            if (target == null)
            {
                return $"Target {_componentType.ToParentType()} with uid {targetQuery?.Objects?.FirstOrDefault()?.Uid} could not be fetched.";
            }
            if (!target.Objects.Any()) //if no uids to copy are present in the target then no object is returned
            {
                return null;
            }
            IEnumerable<string> targetComponentUids = ObjectQueries.GetComponentUids(target.Objects.FirstOrDefault(), _componentType);
            IEnumerable<string> conflictingUids = targetComponentUids.Intersect(_job.Source.ComponentUids);
            if (conflictingUids.Any())
            {
                return $"{_componentType} uids are already present in the target: {string.Join(", ", conflictingUids)}.";
            }
            return null;
        }

        private (WorkerResult, RefreshAction) LogErrorAndReturnResult(string reason)
        {
            Logger.LogError("{errorMessage} {reason} - {description}", _errorMessage, reason, _job.Description());
            return (new WorkerResult(_targetHostname, false, _errorMessage, reason, sourceServerUrl: _sourceHostname), null);
        }
    }
}
