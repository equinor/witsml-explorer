using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Data.MudLog;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Query
{
    public static class MudLogQueries
    {
        public static WitsmlMudLogs QueryByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlMudLogs
            {
                MudLogs = new WitsmlMudLog
                {
                    Uid = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = "",
                    StartMd = MeasureWithDatum.ToEmptyWitsml<WitsmlMeasureWithDatum>(),
                    EndMd = MeasureWithDatum.ToEmptyWitsml<WitsmlMeasureWithDatum>(),
                    CommonData = new WitsmlCommonData()
                    {
                        DTimCreation = "",
                        DTimLastChange = ""
                    }
                }.AsItemInList()
            };
        }

        public static WitsmlMudLogs QueryById(string wellUid, string wellboreUid, string[] mudLogUids)
        {
            return new WitsmlMudLogs
            {
                MudLogs = mudLogUids.Select(uid => new WitsmlMudLog
                {
                    Uid = uid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }).ToList()
            };
        }

        public static WitsmlMudLogs UpdateGeologyInterval(MudLogGeologyInterval geologyInterval, ObjectReference mudLogReference)
        {
            return new WitsmlMudLogs
            {
                MudLogs = new WitsmlMudLog
                {
                    Uid = mudLogReference.Uid,
                    UidWellbore = mudLogReference.WellboreUid,
                    UidWell = mudLogReference.WellUid,
                    GeologyInterval = new()
                    {
                        new()
                        {
                            Uid = geologyInterval.Uid,
                            TypeLithology = geologyInterval.TypeLithology,
                            Description = geologyInterval.Description,
                            MdTop = geologyInterval.MdTop?.ToWitsml<WitsmlMeasureWithDatum>(),
                            MdBottom = geologyInterval.MdBottom?.ToWitsml<WitsmlMeasureWithDatum>(),
                            TvdTop = geologyInterval.TvdTop?.ToWitsml<WitsmlMeasureWithDatum>(),
                            TvdBase = geologyInterval.TvdBase?.ToWitsml<WitsmlMeasureWithDatum>(),
                            RopAv = geologyInterval.RopAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                            WobAv = geologyInterval.WobAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                            TqAv = geologyInterval.TqAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                            CurrentAv = geologyInterval.CurrentAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                            RpmAv = geologyInterval.RpmAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                            WtMudAv = geologyInterval.WtMudAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                            EcdTdAv = geologyInterval.EcdTdAv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                            DxcAv = geologyInterval.DxcAv,
                            Lithologies = geologyInterval.Lithologies?.Select(l => new WitsmlMudLogLithology()
                            {
                                Uid = l.Uid,
                                Type = l.Type,
                                CodeLith = l.CodeLith,
                                LithPc = string.IsNullOrEmpty(l.LithPc) ? null : new WitsmlIndex { Uom = "%", Value = l.LithPc }
                            }).ToList()
                        }
                    },
                }.AsItemInList()
            };
        }
    }
}
