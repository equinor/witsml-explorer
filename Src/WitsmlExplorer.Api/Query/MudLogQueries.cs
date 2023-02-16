using System.Collections.Generic;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Data.MudLog;
using Witsml.Extensions;

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

        public static WitsmlMudLogs QueryById(string wellUid, string wellboreUid, string mudLogUid)
        {
            return new WitsmlMudLogs
            {
                MudLogs = new WitsmlMudLog
                {
                    Uid = mudLogUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };
        }

        public static WitsmlMudLogs SetupMudLogToUpdate(MudLog mudLog)
        {
            List<WitsmlMudLogGeologyInterval> geologyIntervals = mudLog.GeologyInterval.Select(geologyInterval => new WitsmlMudLogGeologyInterval()
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
                CommonTime = new WitsmlCommonTime
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
                    StartMd = mudLog.StartMd.ToWitsml<WitsmlMeasureWithDatum>(),
                    EndMd = mudLog.EndMd.ToWitsml<WitsmlMeasureWithDatum>(),
                    GeologyInterval = geologyIntervals,
                    CommonData = new WitsmlCommonData
                    {
                        ItemState = mudLog.CommonData.ItemState,
                        SourceName = mudLog.CommonData.SourceName
                    }
                }.AsSingletonList()
            };
        }
    }
}
