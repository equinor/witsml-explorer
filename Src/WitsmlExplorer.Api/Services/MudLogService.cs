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
        Task<IEnumerable<MudLog>> GetMudLogs(string wellUid, string wellboreUid);
        Task<MudLog> GetMudLog(string wellUid, string wellboreUid, string mudlogUid);
    }
    // ReSharper disable once UnusedMember.Global
    public class MudLogService : WitsmlService, IMudLogService
    {
        public MudLogService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<IEnumerable<MudLog>> GetMudLogs(string wellUid, string wellboreUid)
        {
            WitsmlMudLogs query = MudLogQueries.QueryByWellbore(wellUid, wellboreUid);
            WitsmlMudLogs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));

            return result.MudLogs.Select(mudLog =>
                new MudLog
                {
                    Uid = mudLog.Uid,
                    Name = mudLog.Name,
                    WellUid = mudLog.UidWell,
                    WellName = mudLog.NameWell,
                    WellboreUid = mudLog.UidWellbore,
                    WellboreName = mudLog.NameWellbore,
                    StartMd = mudLog.StartMd?.Value,
                    EndMd = mudLog.EndMd?.Value,
                    ItemState = mudLog.CommonData.ItemState,
                    DateTimeCreation = StringHelpers.ToDateTime(mudLog.CommonData.DTimCreation),
                }).OrderBy(mudLog => mudLog.Name);
        }

        public async Task<MudLog> GetMudLog(string wellUid, string wellboreUid, string mudlogUid)
        {
            WitsmlMudLogs query = MudLogQueries.QueryById(wellUid, wellboreUid, mudlogUid);
            WitsmlMudLogs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));

            WitsmlMudLog witsmlMudLog = result.MudLogs.FirstOrDefault();
            if (witsmlMudLog == null)
            {
                return null;
            }

            MudLog mudlog = new()
            {
                Uid = witsmlMudLog.Uid,
                Name = witsmlMudLog.Name,
                WellUid = witsmlMudLog.UidWell,
                WellName = witsmlMudLog.NameWell,
                WellboreUid = witsmlMudLog.UidWellbore,
                WellboreName = witsmlMudLog.NameWellbore,
                StartMd = witsmlMudLog.StartMd?.Value,
                EndMd = witsmlMudLog.EndMd?.Value,
                GeologyInterval = GetGeologyIntervals(witsmlMudLog.GeologyInterval),
                ItemState = witsmlMudLog.CommonData.ItemState,
                DateTimeCreation = StringHelpers.ToDateTime(witsmlMudLog.CommonData.DTimCreation),
            };
            return mudlog;
        }

        private static List<MudLogGeologyInterval> GetGeologyIntervals(List<WitsmlMudLogGeologyInterval> geologyIntervals)
        {
            return geologyIntervals.Select(geologyInterval =>
                new MudLogGeologyInterval
                {
                    Uid = geologyInterval.Uid,
                    TypeLithology = geologyInterval.TypeLithology,
                    MdTop = geologyInterval.MdTop?.Value,
                    MdBottom = geologyInterval.MdBottom?.Value,
                    Lithologies = geologyInterval.Lithologies?.Select(l => new MudLogLithology()
                    {
                        Uid = l.Uid,
                        CodeLith = l.CodeLith,
                        LithPc = l.LithPc?.Value,
                        Type = l.Type
                    }).ToList(),
                    CommonTime = new CommonTime
                    {
                        DTimCreation = StringHelpers.ToDateTime(geologyInterval.CommonTime.DTimCreation),
                        DTimLastChange = StringHelpers.ToDateTime(geologyInterval.CommonTime.DTimLastChange)
                    }
                }).ToList();
        }
    }
}
