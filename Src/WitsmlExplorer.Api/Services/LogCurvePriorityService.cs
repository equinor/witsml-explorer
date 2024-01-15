
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Services
{
    public interface ILogCurvePriorityService
    {
        Task<IList<string>> GetPrioritizedCurves(string wellUid, string wellboreUid);
        Task<IList<string>> SetPrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves);
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

        public async Task<IList<string>> SetPrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves)
        {
            if (prioritizedCurves.IsNullOrEmpty())
            {
                await DeleteLogCurvePriorityObject(wellUid, wellboreUid);
                return null;
            }

            IList<string> currentPrioritizedCurves = await GetPrioritizedCurves(wellUid, wellboreUid);
            if (currentPrioritizedCurves == null)
            {
                return await CreatePrioritizedCurves(wellUid, wellboreUid, prioritizedCurves);
            }

            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            LogCurvePriority logCurvePriorityToUpdate = CreateLogCurvePriorityObject(wellUid, wellboreUid, prioritizedCurves);
            LogCurvePriority updatedLogCurvePriority = await logCurvePriorityRepository.UpdateDocumentAsync(logCurvePriorityId, logCurvePriorityToUpdate);
            return updatedLogCurvePriority.PrioritizedCurves;
        }

        private async Task<IList<string>> CreatePrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurvePriorityObject(wellUid, wellboreUid, prioritizedCurves);
            LogCurvePriority inserted = await logCurvePriorityRepository.CreateDocumentAsync(logCurvePriorityToCreate);
            return inserted.PrioritizedCurves;
        }

        private async Task DeleteLogCurvePriorityObject(string wellUid, string wellboreUid)
        {
            IList<string> currentPrioritizedCurves = await GetPrioritizedCurves(wellUid, wellboreUid);
            if (currentPrioritizedCurves != null)
            {
                string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
                await logCurvePriorityRepository.DeleteDocumentAsync(logCurvePriorityId);
            }
            return;
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
