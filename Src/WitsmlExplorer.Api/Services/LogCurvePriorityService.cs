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
        Task<IList<string>> GetPrioritizedLocalCurves(string wellUid, string wellboreUid);
        Task<IList<string>> SetPrioritizedLocalCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves);
        Task<IList<string>> SetPrioritizedUniversalCurves(List<string> prioritizedCurves);
        Task<IList<string>> GetPrioritizedUniversalCurves();
    }

    public class LogCurvePriorityService(
        IDocumentRepository<LogCurvePriority, string>
            logCurvePriorityRepository)
        : ILogCurvePriorityService
    {
        private const string UniversalDbId = "universal";
        public async Task<IList<string>> GetPrioritizedLocalCurves(string wellUid, string wellboreUid)
        {
            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            LogCurvePriority logCurvePriority = await logCurvePriorityRepository.GetDocumentAsync(logCurvePriorityId);
            return logCurvePriority?.PrioritizedCurves;
        }

        public async Task<IList<string>> SetPrioritizedLocalCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves)
        {
            if (prioritizedCurves.IsNullOrEmpty())
            {
                await DeleteLogCurvePriorityObject(wellUid, wellboreUid);
                return null;
            }

            prioritizedCurves = prioritizedCurves.Distinct().ToList();
            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            LogCurvePriority logCurvePriority = await logCurvePriorityRepository.GetDocumentAsync(logCurvePriorityId);
            if (logCurvePriority == null)
            {
                return await CreatePrioritizedCurves(wellUid, wellboreUid, prioritizedCurves);
            }

            LogCurvePriority logCurvePriorityToUpdate = CreateLogCurvePriorityLocalObject(wellUid, wellboreUid, prioritizedCurves);
            LogCurvePriority updatedLogCurvePriority = await logCurvePriorityRepository.UpdateDocumentAsync(logCurvePriorityId, logCurvePriorityToUpdate);
            return updatedLogCurvePriority.PrioritizedCurves;
        }

        public async Task<IList<string>> GetPrioritizedUniversalCurves()
        {
            LogCurvePriority logCurvePriorityGlobal = await logCurvePriorityRepository.GetDocumentAsync(UniversalDbId);
            return logCurvePriorityGlobal?.PrioritizedCurves;
        }

        public async Task<IList<string>> SetPrioritizedUniversalCurves(List<string> prioritizedCurves)
        {
            prioritizedCurves = prioritizedCurves.Distinct().ToList();
            var globalDocument = await logCurvePriorityRepository.GetDocumentAsync(UniversalDbId);
            if (globalDocument == null)
            {
                return await CreatePrioritizedUniversalCurves(prioritizedCurves);
            }
            return await UpdatePrioritizedUniversalCurves(prioritizedCurves);
        }


        private async Task<IList<string>> CreatePrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurvePriorityLocalObject(wellUid, wellboreUid, prioritizedCurves);
            LogCurvePriority inserted = await logCurvePriorityRepository.CreateDocumentAsync(logCurvePriorityToCreate);
            return inserted.PrioritizedCurves;
        }

        private async Task DeleteLogCurvePriorityObject(string wellUid, string wellboreUid)
        {
            IList<string> currentPrioritizedCurves = await GetPrioritizedLocalCurves(wellUid, wellboreUid);
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

        private LogCurvePriority CreateLogCurvePriorityLocalObject(string wellUid, string wellboreUid, IList<string> prioritizedCurves)
        {
            string logCurvePriorityId = GetLogCurvePriorityId(wellUid, wellboreUid);
            LogCurvePriority logCurvePriorityObject = new(logCurvePriorityId)
            {
                PrioritizedCurves = prioritizedCurves
            };
            return logCurvePriorityObject;
        }

        private async Task<IList<string>> CreatePrioritizedUniversalCurves(List<string> logCurvePriorities)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurveUniversalPriorityObject(logCurvePriorities);
            LogCurvePriority inserted = await logCurvePriorityRepository.CreateDocumentAsync(logCurvePriorityToCreate);
            return inserted.PrioritizedCurves;
        }

        private async Task<IList<string>> UpdatePrioritizedUniversalCurves(List<string> logCurvePriorities)
        {
            LogCurvePriority logCurvePriorityToCreate = CreateLogCurveUniversalPriorityObject(logCurvePriorities);
            LogCurvePriority updated = await logCurvePriorityRepository.UpdateDocumentAsync(UniversalDbId, logCurvePriorityToCreate);
            return updated.PrioritizedCurves;
        }

        private LogCurvePriority CreateLogCurveUniversalPriorityObject(List<string> prioritizedCurves)
        {
            LogCurvePriority logCurvePriorityObject = new(UniversalDbId)
            {
                PrioritizedCurves = prioritizedCurves
            };
            return logCurvePriorityObject;
        }
    }
}
