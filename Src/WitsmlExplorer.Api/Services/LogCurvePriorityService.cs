
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
        Task<LogCurvePriorities> SetPrioritizedCurves(string wellUid, string wellboreUid, LogCurvePriorities priorities);
        Task<IList<string>> GetPrioritizedGlobalCurves();
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

        public async Task<IList<string>> GetPrioritizedGlobalCurves()
        {
            LogCurvePriority logCurvePriorityGlobal = await logCurvePriorityRepository.GetDocumentAsync("global");
            return logCurvePriorityGlobal?.PrioritizedCurves;
        }

        public async Task<LogCurvePriorities> SetPrioritizedCurves(string wellUid, string wellboreUid, LogCurvePriorities priorities)
        {
            if (priorities.PrioritizedCurves.IsNullOrEmpty())
            {
                await DeleteLogCurvePriorityObject(wellUid, wellboreUid);
            }

            var result = new LogCurvePriorities();

            IList<string> currentPrioritizedCurves = await GetPrioritizedCurves(wellUid, wellboreUid);
            if (currentPrioritizedCurves == null)
            {
                var prioritedCurves =
                    await CreatePrioritizedCurves(wellUid, wellboreUid,
                        priorities);
                result.PrioritizedCurves = prioritedCurves;
            }
            else
            {
                string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
                LogCurvePriority logCurvePriorityToUpdate = CreateLogCurvePriorityObject(wellUid, wellboreUid, priorities);
                LogCurvePriority updatedLogCurvePriority = await logCurvePriorityRepository.UpdateDocumentAsync(logCurvePriorityId, logCurvePriorityToUpdate);
                result.PrioritizedCurves = updatedLogCurvePriority.PrioritizedCurves;
            }



            {
                LogCurvePriority logCurvePriorityToUpdate = CreateLogCurveGlobalPriorityObject( priorities);
                var globalDocument = await logCurvePriorityRepository.GetDocumentAsync("global");
                if (globalDocument == null)
                {
                    var s = CreatePrioritizedGlobalCurves(priorities);
                }
                else
                {
                    var s = UpdatePrioritizedGlobalCurves(priorities);
                }

            }


            return result;
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

        private async Task<IList<string>> UpdatePrioritizedGlobalCurves( LogCurvePriorities logCurvePriorities)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurveGlobalPriorityObject( logCurvePriorities);
            LogCurvePriority inserted = await logCurvePriorityRepository.UpdateDocumentAsync("global",logCurvePriorityToCreate);
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
                PrioritizedCurves = prioritizedCurves.PrioritizedGlobalCurves
            };
            return logCurvePriorityObject;
        }
    }
}
