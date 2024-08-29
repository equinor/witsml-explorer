
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
        Task<IList<string>> SetPrioritizedCurves(string wellUid, string wellboreUid, LogCurvePriorities priorities);
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
            LogCurvePriority logCurvePriorityGlobal = await logCurvePriorityRepository.GetDocumentAsync("global");
            return logCurvePriority?.PrioritizedCurves;
        }

        public async Task<IList<string>> SetPrioritizedCurves(string wellUid, string wellboreUid, LogCurvePriorities priorities)
        {
            if (priorities.PrioritizedCurves.IsNullOrEmpty())
            {
                await DeleteLogCurvePriorityObject(wellUid, wellboreUid);
                return null;
            }

            IList<string> currentPrioritizedCurves = await GetPrioritizedCurves(wellUid, wellboreUid);
            if (currentPrioritizedCurves == null)
            {
                return await CreatePrioritizedCurves(wellUid, wellboreUid, priorities);
            }
            return await CreatePrioritizedGlobalCurves( priorities);
          //  string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
          //  LogCurvePriority logCurvePriorityToUpdate = CreateLogCurvePriorityObject(wellUid, wellboreUid, priorities);
            var globalist = CreateLogCurveGlobalPriorityObject(priorities);
        //    LogCurvePriority updatedLogCurvePriority = await logCurvePriorityRepository.UpdateDocumentAsync(logCurvePriorityId, logCurvePriorityToUpdate);
            var updateGlobal = await logCurvePriorityRepository.CreateDocumentAsync( globalist);
            return updateGlobal.PrioritizedCurves;
        }

        private async Task<IList<string>> CreatePrioritizedCurves(string wellUid, string wellboreUid, LogCurvePriorities logCurvePriorities)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurvePriorityObject(wellUid, wellboreUid, logCurvePriorities);
            LogCurvePriority inserted = await logCurvePriorityRepository.CreateDocumentAsync(logCurvePriorityToCreate);
            return inserted.PrioritizedCurves;
        }

        private async Task<IList<string>> CreatePrioritizedGlobalCurves( LogCurvePriorities logCurvePriorities)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurveGlobalPriorityObject( logCurvePriorities);
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

        private LogCurvePriority CreateLogCurvePriorityObject(string wellUid, string wellboreUid, LogCurvePriorities prioritizedCurves)
        {
            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            LogCurvePriority logCurvePriorityObject = new(logCurvePriorityId)
            {
                PrioritizedCurves = prioritizedCurves.PrioritizedCurves
            };
            return logCurvePriorityObject;
        }

        private LogCurvePriority CreateLogCurveGlobalPriorityObject(LogCurvePriorities prioritizedCurves)
        {
            string logCurvePriorityId = "global";
            LogCurvePriority logCurvePriorityObject = new(logCurvePriorityId)
            {
                PrioritizedCurves = prioritizedCurves.PrioritizedGlobalCurves.Where(x => x.Equals("WOB")).ToList()
            };
            return logCurvePriorityObject;
        }
    }
}
