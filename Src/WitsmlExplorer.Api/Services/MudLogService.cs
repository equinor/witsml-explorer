using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data.MudLog;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IMudLogService
    {
        Task<ICollection<MudLog>> GetMudLogs(string wellUid, string wellboreUid);
        Task<MudLog> GetMudLog(string wellUid, string wellboreUid, string mudlogUid);
        Task<List<MudLogGeologyInterval>> GetGeologyIntervals(string wellUid, string wellboreUid, string mudlogUid);
    }
    // ReSharper disable once UnusedMember.Global
    public class MudLogService : WitsmlService, IMudLogService
    {
        public MudLogService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<ICollection<MudLog>> GetMudLogs(string wellUid, string wellboreUid)
        {
            WitsmlMudLogs query = MudLogQueries.QueryByWellbore(wellUid, wellboreUid);
            WitsmlMudLogs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));

            return result.MudLogs.Select(MudLog.FromWitsml).OrderBy(mudLog => mudLog.Name).ToList();
        }

        public async Task<MudLog> GetMudLog(string wellUid, string wellboreUid, string mudlogUid)
        {
            WitsmlMudLogs query = MudLogQueries.QueryById(wellUid, wellboreUid, new string[] { mudlogUid });
            WitsmlMudLogs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));

            WitsmlMudLog witsmlMudLog = result.MudLogs.FirstOrDefault();
            if (witsmlMudLog == null)
            {
                return null;
            }

            return MudLog.FromWitsml(witsmlMudLog);
        }

        public async Task<List<MudLogGeologyInterval>> GetGeologyIntervals(string wellUid, string wellboreUid, string mudlogUid)
        {
            return (await GetMudLog(wellUid, wellboreUid, mudlogUid))?.GeologyInterval;
        }
    }
}
