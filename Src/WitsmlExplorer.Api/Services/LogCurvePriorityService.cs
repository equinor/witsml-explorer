
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Services
{
    public interface ILogCurvePriorityService
    {
        Task<IList<string>> GetPrioritizedCurves(string wellUid, string wellboreUid);
        Task<IList<string>> CreatePrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves);
        Task<IList<string>> UpdatePrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves, bool append);
        Task<IList<string>> DeletePrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurvesToDelete);
    }

    public class LogCurvePriorityService : ILogCurvePriorityService
    {
        private readonly IDocumentRepository<LogCurvePriority, string> logCurvePriorityRepository;

        public LogCurvePriorityService(IDocumentRepository<LogCurvePriority, string> logCurvePriorityRepository)
        {
            this.logCurvePriorityRepository = logCurvePriorityRepository;
        }

        public async Task<IList<string>> GetPrioritizedCurves(string wellUid, string wellboreUid)
        {
            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            LogCurvePriority logCurvePriority = await logCurvePriorityRepository.GetDocumentAsync(logCurvePriorityId);
            return logCurvePriority?.PrioritizedCurves;
        }

        public async Task<IList<string>> CreatePrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurvePriorityObject(wellUid, wellboreUid, prioritizedCurves);
            LogCurvePriority inserted = await logCurvePriorityRepository.CreateDocumentAsync(logCurvePriorityToCreate);
            return inserted.PrioritizedCurves;
        }

        public async Task<IList<string>> UpdatePrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves, bool append)
        {
            IList<string> currentPrioritizedCurves = await GetPrioritizedCurves(wellUid, wellboreUid);
            if (currentPrioritizedCurves == null)
            {
                return await CreatePrioritizedCurves(wellUid, wellboreUid, prioritizedCurves);
            }

            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            IList<string> newPrioritizedCurves = append ? prioritizedCurves.Union(currentPrioritizedCurves).ToList() : prioritizedCurves;
            LogCurvePriority logCurvePriorityToUpdate = CreateLogCurvePriorityObject(wellUid, wellboreUid, newPrioritizedCurves);
            LogCurvePriority updatedLogCurvePriority = await logCurvePriorityRepository.UpdateDocumentAsync(logCurvePriorityId, logCurvePriorityToUpdate);
            return updatedLogCurvePriority.PrioritizedCurves;
        }

        public async Task<IList<string>> DeletePrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurvesToDelete)
        {
            IList<string> currentPrioritizedCurves = await GetPrioritizedCurves(wellUid, wellboreUid);
            if (currentPrioritizedCurves == null)
            {
                throw new ArgumentException($"No prioritized curves found for wellUid: {wellUid} and wellboreUid: {wellboreUid}");
            }

            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            IList<string> newPrioritizedCurves = currentPrioritizedCurves.Except(prioritizedCurvesToDelete).ToList();
            LogCurvePriority logCurvePriorityToUpdate = CreateLogCurvePriorityObject(wellUid, wellboreUid, newPrioritizedCurves);
            LogCurvePriority updatedLogCurvePriority = await logCurvePriorityRepository.UpdateDocumentAsync(logCurvePriorityId, logCurvePriorityToUpdate);
            return updatedLogCurvePriority.PrioritizedCurves;
        }

        private string GetLogCurvePriorityId(string wellUid, string wellboreUid)
        {
            return $"{wellUid}-{wellboreUid}";
        }

        private LogCurvePriority CreateLogCurvePriorityObject(string wellUid, string wellboreUid, IList<string> prioritizedCurves)
        {
            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            LogCurvePriority logCurvePriorityObject = new(logCurvePriorityId)
            {
                PrioritizedCurves = prioritizedCurves
            };
            return logCurvePriorityObject;
        }
    }
}
