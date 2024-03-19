using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Create
{

    public class CreateRiskWorker : BaseWorker<CreateRiskJob>, IWorker
    {
        public JobType JobType => JobType.CreateRisk;

        public CreateRiskWorker(ILogger<CreateRiskJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateRiskJob job, CancellationToken? cancellationToken = null)
        {
            Risk risk = job.Risk;
            Verify(risk);

            WitsmlRisks riskToCreate = risk.ToWitsml();

            QueryResult result = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(riskToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilRiskHasBeenCreated(risk);
                Logger.LogInformation("Risk created. {jobDescription}", job.Description());
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Risk created ({risk.Name} [{risk.Uid}])");
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), risk.WellUid, risk.WellboreUid, EntityType.Risk, JobType);
                return (workerResult, refreshAction);
            }

            EntityDescription description = new() { WellboreName = risk.WellboreName };
            string errorMessage = "Failed to create Risk.";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }
        private async Task WaitUntilRiskHasBeenCreated(Risk risk)
        {
            bool isCreated = false;
            WitsmlRisks query = RiskQueries.QueryById(risk.WellUid, risk.WellboreUid, risk.Uid);
            int maxRetries = 30;
            while (!isCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created Risk with name {risk.Name} (id={risk.Uid})");
                }
                Thread.Sleep(1000);
                WitsmlRisks riskResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
                isCreated = riskResult.Risks.Any();
            }
        }

        private static void Verify(Risk risk)
        {
            if (string.IsNullOrEmpty(risk.Uid))
            {
                throw new InvalidOperationException($"{nameof(risk.Uid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(risk.Name))
            {
                throw new InvalidOperationException($"{nameof(risk.Name)} cannot be empty");
            }
        }
    }
}
