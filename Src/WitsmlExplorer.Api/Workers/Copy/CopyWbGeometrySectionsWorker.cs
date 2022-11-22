using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyWbGeometrySectionsWorker : BaseWorker<CopyWbGeometrySectionsJob>, IWorker
    {

        public JobType JobType => JobType.CopyWbGeometrySections;

        public CopyWbGeometrySectionsWorker(ILogger<CopyWbGeometrySectionsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyWbGeometrySectionsJob job)
        {
            IWitsmlClient witsmlClient = GetTargetWitsmlClientOrThrow();
            (WitsmlWbGeometry targetWbGeometry, IEnumerable<WitsmlWbGeometrySection> componentsToCopy) = await FetchData(job);
            string errorMessage = "Failed to copy wbGeometrySections.";
            IEnumerable<string> intersection = targetWbGeometry.WbGeometrySections.Select((wbs) => wbs.Uid).Intersect(job.Source.ComponentUids);
            if (intersection.Any())
            {
                string duplicatedUids = string.Join(", ", intersection);
                string reason = $"Could not copy wbGeometrySections due to uids already being present in the target: {duplicatedUids}.";
                Logger.LogWarning("{errorMessage} {reason} - {description}", errorMessage, reason, job.Description());
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, reason), null);
            }
            if (componentsToCopy.Count() != job.Source.ComponentUids.Length)
            {
                string missingUids = string.Join(", ", componentsToCopy.Select((ts) => ts.Uid).Where((uid) => !job.Source.ComponentUids.Contains(uid)));
                string reason = $"Could not retrieve all wbGeometrySections, missing uids: {missingUids}.";
                Logger.LogError("{errorMessage} {reason} - {description}", errorMessage, reason, job.Description());
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, reason), null);
            }
            WitsmlWbGeometrys updatedWbGeometryQuery = WbGeometryQueries.CopyWbGeometrySections(targetWbGeometry, componentsToCopy);
            QueryResult copyResult = await witsmlClient.UpdateInStoreAsync(updatedWbGeometryQuery);
            string wbGeometrySectionsString = string.Join(", ", job.Source.ComponentUids);
            if (!copyResult.IsSuccessful)
            {
                Logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, copyResult.Reason), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshWbGeometry refreshAction = new(witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Target.Uid, RefreshType.Update);
            WorkerResult workerResult = new(witsmlClient.GetServerHostname(), true, $"WbGeometrySections {wbGeometrySectionsString} copied to: {targetWbGeometry.Name}");

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlWbGeometry, IEnumerable<WitsmlWbGeometrySection>>> FetchData(CopyWbGeometrySectionsJob job)
        {
            Task<WitsmlWbGeometry> targetWbGeometryQuery = GetWbGeometry(job.Target, GetTargetWitsmlClientOrThrow());
            Task<IEnumerable<WitsmlWbGeometrySection>> sourceWbGeometrySectionsQuery = GetSourceWbGeometrySections(job.Source.Parent, job.Source.ComponentUids);
            await Task.WhenAll(targetWbGeometryQuery, sourceWbGeometrySectionsQuery);
            WitsmlWbGeometry targetWbGeometry = targetWbGeometryQuery.Result;
            IEnumerable<WitsmlWbGeometrySection> sourceWbGeometrySections = sourceWbGeometrySectionsQuery.Result;
            return Tuple.Create(targetWbGeometry, sourceWbGeometrySections);
        }

        private static async Task<WitsmlWbGeometry> GetWbGeometry(ObjectReference wbGeometryReference, IWitsmlClient client)
        {
            WitsmlWbGeometrys witsmlWbGeometry = WbGeometryQueries.GetWitsmlWbGeometryById(wbGeometryReference.WellUid, wbGeometryReference.WellboreUid, wbGeometryReference.Uid);
            WitsmlWbGeometrys result = await client.GetFromStoreAsync(witsmlWbGeometry, new OptionsIn(ReturnElements.All));
            return !result.WbGeometrys.Any() ? null : result.WbGeometrys.First();
        }

        private async Task<IEnumerable<WitsmlWbGeometrySection>> GetSourceWbGeometrySections(ObjectReference wbGeometryReference, IEnumerable<string> wbGeometrySectionsUids)
        {
            WitsmlWbGeometry witsmlWbGeometry = await GetWbGeometry(wbGeometryReference, GetSourceWitsmlClientOrThrow());
            return witsmlWbGeometry?.WbGeometrySections.FindAll((WitsmlWbGeometrySection wbs) => wbGeometrySectionsUids.Contains(wbs.Uid));
        }
    }
}
