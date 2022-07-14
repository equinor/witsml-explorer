using System;
using System.Globalization;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public static class BhaRunQueries
    {
        public static WitsmlBhaRuns GetWitsmlBhaRunByUid(string wellUid, string wellboreUid, string bhaRunUid)
        {
            return new WitsmlBhaRuns
            {
                BhaRuns = new WitsmlBhaRun
                {
                    Uid = bhaRunUid,
                    WellUid = wellUid,
                    WellboreUid = wellboreUid
                }.AsSingletonList()
            };
        }
    }
}
