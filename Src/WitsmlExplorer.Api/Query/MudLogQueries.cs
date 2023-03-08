using System.Collections.Generic;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Data.MudLog;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

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
                }.AsSingletonList()
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

        public static WitsmlMudLogs SetupMudLogToUpdate(MudLog mudLog)
        {
            List<WitsmlMudLogGeologyInterval> geologyIntervals = mudLog.GeologyInterval?.Select(geologyInterval => new WitsmlMudLogGeologyInterval()
            {
                Uid = geologyInterval.Uid,
                TypeLithology = geologyInterval.TypeLithology,
                MdTop = geologyInterval.MdTop.ToWitsml<WitsmlMeasureWithDatum>(),
                MdBottom = geologyInterval.MdBottom.ToWitsml<WitsmlMeasureWithDatum>(),
                Lithologies = geologyInterval.Lithologies?.Select(l => new WitsmlMudLogLithology()
                {
                    Uid = l.Uid,
                    Type = l.Type,
                    CodeLith = l.CodeLith,
                    LithPc = new WitsmlIndex { Uom = "%", Value = l.LithPc }
                }).ToList(),
                CommonTime = geologyInterval.CommonTime == null ? null : new WitsmlCommonTime
                {
                    DTimCreation = geologyInterval.CommonTime.DTimCreation,
                    DTimLastChange = geologyInterval.CommonTime.DTimLastChange
                },
            }).ToList();

            return new WitsmlMudLogs
            {
                MudLogs = new WitsmlMudLog
                {
                    Uid = mudLog.Uid,
                    UidWellbore = mudLog.WellboreUid,
                    UidWell = mudLog.WellUid,
                    Name = mudLog.Name,
                    NameWellbore = mudLog.WellboreName,
                    NameWell = mudLog.WellName,
                    ObjectGrowing = StringHelpers.OptionalBooleanToString(mudLog.ObjectGrowing),
                    MudLogCompany = mudLog.MudLogCompany,
                    MudLogEngineers = mudLog.MudLogEngineers,
                    StartMd = mudLog.StartMd?.ToWitsml<WitsmlMeasureWithDatum>(),
                    EndMd = mudLog.EndMd?.ToWitsml<WitsmlMeasureWithDatum>(),
                    GeologyInterval = geologyIntervals,
                    CommonData = mudLog.CommonData == null ? null : new WitsmlCommonData
                    {
                        ItemState = mudLog.CommonData.ItemState,
                        SourceName = mudLog.CommonData.SourceName
                    }
                }.AsSingletonList()
            };
        }

        public static WitsmlMudLogs CopyGeologyIntervals(IEnumerable<WitsmlMudLogGeologyInterval> geologyIntervals, ObjectReference target)
        {
            return new()
            {
                MudLogs = new List<WitsmlMudLog> {
                    new WitsmlMudLog() {
                        Uid = target.Uid,
                        UidWellbore = target.WellboreUid,
                        UidWell = target.WellUid,
                        GeologyInterval = geologyIntervals.ToList()
                    }
                }
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
                }.AsSingletonList()
            };
        }
    }
}
