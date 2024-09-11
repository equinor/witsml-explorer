
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
        Task<IList<string>> SetPrioritizedGlobalCurves(List<string> prioritizedCurves);
        Task<IList<string>> GetPrioritizedGlobalCurves();
    }

    public class LogCurvePriorityService(
        IDocumentRepository<LogCurvePriority, string>
            logCurvePriorityRepository)
        : ILogCurvePriorityService
    {
        private const string Global = "global";
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

            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            LogCurvePriority logCurvePriority = await logCurvePriorityRepository.GetDocumentAsync(logCurvePriorityId);
            if (logCurvePriority == null)
            {
                return await CreatePrioritizedCurves(wellUid, wellboreUid, prioritizedCurves);
            }

            LogCurvePriority logCurvePriorityToUpdate = CreateLogCurvePriorityObject(wellUid, wellboreUid, prioritizedCurves);
            LogCurvePriority updatedLogCurvePriority = await logCurvePriorityRepository.UpdateDocumentAsync(logCurvePriorityId, logCurvePriorityToUpdate);
            return updatedLogCurvePriority.PrioritizedCurves;
        }

        public async Task<IList<string>> GetPrioritizedGlobalCurves()
        {
            LogCurvePriority logCurvePriorityGlobal = await logCurvePriorityRepository.GetDocumentAsync(Global);
            return logCurvePriorityGlobal?.PrioritizedCurves;
        }

        public async Task<IList<string>> SetPrioritizedGlobalCurves(List<string> prioritizedCurves)
        {
            var priorities = new LogCurvePriorities();
            priorities.PrioritizedGlobalCurves = prioritizedCurves;
            var globalDocument = await logCurvePriorityRepository.GetDocumentAsync(Global);
            if (globalDocument == null)
            {
                return await CreatePrioritizedGlobalCurves(priorities);
            }
            return await UpdatePrioritizedGlobalCurves(priorities);
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

        private async Task<IList<string>> CreatePrioritizedGlobalCurves(LogCurvePriorities logCurvePriorities)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurveGlobalPriorityObject(logCurvePriorities);
            LogCurvePriority inserted = await logCurvePriorityRepository.CreateDocumentAsync(logCurvePriorityToCreate);
            return inserted.PrioritizedCurves;
        }

        private async Task<IList<string>> UpdatePrioritizedGlobalCurves(LogCurvePriorities logCurvePriorities)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurveGlobalPriorityObject(logCurvePriorities);
            LogCurvePriority inserted = await logCurvePriorityRepository.UpdateDocumentAsync(Global, logCurvePriorityToCreate);
            return inserted.PrioritizedCurves;
        }

        private LogCurvePriority CreateLogCurveGlobalPriorityObject(LogCurvePriorities prioritizedCurves)
        {
            LogCurvePriority logCurvePriorityObject = new(Global)
            {
                PrioritizedCurves = prioritizedCurves.PrioritizedGlobalCurves
            };
            return logCurvePriorityObject;
        }
    }
}
