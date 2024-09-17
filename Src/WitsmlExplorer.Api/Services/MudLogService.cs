using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data.MudLog;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IMudLogService
    {
        Task<ICollection<MudLog>> GetMudLogs(string wellUid, string wellboreUid);
        Task<MudLog> GetMudLog(string wellUid, string wellboreUid, string mudlogUid);
    }
    // ReSharper disable once UnusedMember.Global
    public class MudLogService : WitsmlService, IMudLogService
    {
        public MudLogService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<ICollection<MudLog>> GetMudLogs(string wellUid, string wellboreUid)
        {
            WitsmlMudLogs query = MudLogQueries.QueryByWellbore(wellUid, wellboreUid);
            WitsmlMudLogs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));

            return result.MudLogs.Select(FromWitsml).OrderBy(mudLog => mudLog.Name).ToList();
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

            MudLog mudlog = FromWitsml(witsmlMudLog);
            mudlog.GeologyInterval = GetGeologyIntervals(witsmlMudLog.GeologyInterval);
            return mudlog;
        }

        private static List<MudLogGeologyInterval> GetGeologyIntervals(List<WitsmlMudLogGeologyInterval> geologyIntervals)
        {
            return geologyIntervals.Select(geologyInterval =>
                new MudLogGeologyInterval
                {
                    Uid = geologyInterval.Uid,
                    TypeLithology = geologyInterval.TypeLithology,
                    MdTop = MeasureWithDatum.FromWitsml(geologyInterval.MdTop),
                    MdBottom = MeasureWithDatum.FromWitsml(geologyInterval.MdBottom),
                    TvdTop = MeasureWithDatum.FromWitsml(geologyInterval.TvdTop),
                    TvdBase = MeasureWithDatum.FromWitsml(geologyInterval.TvdBase),
                    RopAv = LengthMeasure.FromWitsml(geologyInterval.RopAv),
                    WobAv = LengthMeasure.FromWitsml(geologyInterval.WobAv),
                    TqAv = LengthMeasure.FromWitsml(geologyInterval.TqAv),
                    CurrentAv = LengthMeasure.FromWitsml(geologyInterval.CurrentAv),
                    RpmAv = LengthMeasure.FromWitsml(geologyInterval.RpmAv),
                    WtMudAv = LengthMeasure.FromWitsml(geologyInterval.WtMudAv),
                    EcdTdAv = LengthMeasure.FromWitsml(geologyInterval.EcdTdAv),
                    DxcAv = geologyInterval.DxcAv,
                    Lithologies = geologyInterval.Lithologies?.Select(l => new MudLogLithology()
                    {
                        Uid = l.Uid,
                        CodeLith = l.CodeLith,
                        LithPc = l.LithPc?.Value,
                        Type = l.Type
                    }).ToList(),
                    Description = geologyInterval.Description,
                    CommonTime = new CommonTime
                    {
                        DTimCreation = geologyInterval.CommonTime?.DTimCreation,
                        DTimLastChange = geologyInterval.CommonTime?.DTimLastChange
                    }
                }).ToList();
        }

        private static MudLog FromWitsml(WitsmlMudLog witsmlMudLog)
        {
            return witsmlMudLog == null ? null : new()
            {
                Uid = witsmlMudLog.Uid,
                Name = witsmlMudLog.Name,
                WellUid = witsmlMudLog.UidWell,
                WellName = witsmlMudLog.NameWell,
                WellboreUid = witsmlMudLog.UidWellbore,
                WellboreName = witsmlMudLog.NameWellbore,
                MudLogCompany = witsmlMudLog.MudLogCompany,
                MudLogEngineers = witsmlMudLog.MudLogEngineers,
                StartMd = MeasureWithDatum.FromWitsml(witsmlMudLog.StartMd),
                EndMd = MeasureWithDatum.FromWitsml(witsmlMudLog.EndMd),
                GeologyInterval = GetGeologyIntervals(witsmlMudLog.GeologyInterval),
                CommonData = new CommonData()
                {
                    DTimCreation = witsmlMudLog.CommonData.DTimCreation,
                    DTimLastChange = witsmlMudLog.CommonData.DTimLastChange,
                    ItemState = witsmlMudLog.CommonData.ItemState,
                }
            };
        }
    }
}
