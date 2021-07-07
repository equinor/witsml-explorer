using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Query
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
                    StartMd = new WitsmlIndex(),
                    EndMd = new WitsmlIndex(),
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
    }
}
