using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using System;
using System.Threading;
using Witsml.Data.Measures;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Workers
{
    public interface ICreateLogObjectWorker
    {
        Task<(WorkerResult, RefreshWellbore)> Execute(CreateLogObjectJob job);
    }

    public class CreateLogObjectWorker : ICreateLogObjectWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public CreateLogObjectWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshWellbore)> Execute(CreateLogObjectJob job)
        {
            var logObject = job.LogObject;
            Verify(logObject);

            var logObjectToCreate = SetupLogObjectToCreate(logObject);

            var result = await witsmlClient.AddToStoreAsync(logObjectToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilLogObjectHasBeenCreated(logObject);
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Logobject created ({logObject.Name} [{logObject.Uid}])");
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), logObject.WellUid, logObject.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            var description = new EntityDescription { WellName = logObject.WellName, WellboreName = logObject.WellboreName, ObjectName = logObject.Name };
            Log.Error($"Job failed. An error occurred when creating logobject: {job.LogObject.PrintProperties()}");
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to create logobject", result.Reason, description), null);
        }
   

        private static WitsmlLogs CreateRequest(string wellUid, string wellboreUid, string logUid)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = logUid
                }.AsSingletonList()
            };
        }

        private async Task WaitUntilLogObjectHasBeenCreated(LogObject logobject)
        {
            var isLogCreated = false;
            var query = LogQueries.QueryById(logobject.WellUid, logobject.WellboreUid, logobject.Uid);
            var maxRetries = 30;
            while (!isLogCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created log with name {logobject.Name} (id={logobject.Uid})");
                }
                Thread.Sleep(1000);
                var logResult = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);
                isLogCreated = logResult.Logs.Any();
            }
        }

        private static WitsmlLogs SetupLogObjectToCreate(LogObject logObject)
        {
            var logCurveInfos = logObject.LogCurveInfo.Select(curveInfo => new WitsmlLogCurveInfo()
            {
                Uid = curveInfo.Uid,
                Mnemonic = curveInfo.Mnemonic,
                Unit = curveInfo.Unit,
                MnemAlias = curveInfo.MnemAlias,
                NullValue = curveInfo.NullValue,
                MinIndex = new WitsmlIndex { Uom = "m", Value = curveInfo.MinDepthIndex },
                MaxIndex = new WitsmlIndex { Uom = "m", Value = curveInfo.MaxDepthIndex },
                CurveDescription = curveInfo.CurveDescription,
                TypeLogData = curveInfo.TypeLogData
            }).ToList();


            var data = new List<WitsmlData>();
            foreach(var row in logObject.LogData.DataCsv)
            {
                data.Add(new WitsmlData { Data = row });
            }
            var logData = new WitsmlLogData
            {
                MnemonicList = logObject.LogData.MnemonicList,
                UnitList = logObject.LogData.UnitList,
                Data = data
            };

            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = logObject.Uid,
                    UidWell = logObject.WellUid,
                    UidWellbore = logObject.WellboreUid,
                    NameWell = logObject.WellName,
                    NameWellbore = logObject.WellboreName,
                    Name = logObject.Name,
                    ObjectGrowing = logObject.ObjectGrowing.ToString(),
                    ServiceCompany = logObject.ServiceCompany,
                    IndexType = logObject.IndexType,
                    StartIndex = new WitsmlIndex { Uom = "m", Value = logObject.StartIndex },
                    EndIndex = new WitsmlIndex { Uom = "m", Value = logObject.EndIndex },
                    IndexCurve = new WitsmlIndexCurve { Value = logObject.IndexCurve },
                    Direction = "increasing",
                    CreationDate = logObject.DateTimeCreation.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                    LogCurveInfo = logCurveInfos,
                    LogData = logData,
                    CommonData = new WitsmlCommonData
                    {
                        ItemState = logObject.CommonData.ItemState,
                        SourceName = logObject.CommonData.SourceName,
                        DTimCreation = logObject.CommonData.DTimCreation?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                        DTimLastChange = logObject.CommonData.DTimLastChange?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                    },

                }.AsSingletonList()
            };
        }

        private void Verify(LogObject logObject)
        {
            if (string.IsNullOrEmpty(logObject.Uid)) throw new InvalidOperationException($"{nameof(logObject.Uid)} cannot be empty");
            if (string.IsNullOrEmpty(logObject.Name)) throw new InvalidOperationException($"{nameof(logObject.Name)} cannot be empty");
        }
    }
}

