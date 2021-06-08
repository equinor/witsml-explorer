using System;
using System.Linq;
using System.Threading;
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
using Witsml.Data.Measures;

namespace WitsmlExplorer.Api.Workers
{
    public interface ICreateTrajectoryWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CreateTrajectoryJob job);
    }

    public class CreateTrajectoryWorker : ICreateTrajectoryWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public CreateTrajectoryWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CreateTrajectoryJob job)
        {
            var trajectory = job.Trajectory;
            Verify(trajectory);

            var trajectoryToCreate = SetupTrajectoryToCreate(trajectory);

            var result = await witsmlClient.AddToStoreAsync(trajectoryToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilTrajectoryHasBeenCreated(trajectory);
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Trajectory created ({trajectory.Name} [{trajectory.Uid}])");
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), trajectory.WellUid, trajectory.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            var description = new EntityDescription { WellboreName = trajectory.Name };
            Log.Error($"Job failed. An error occurred when creating trajectory: {job.Trajectory.PrintProperties()}");
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to create trajectory", result.Reason, description), null);        }

        private async Task WaitUntilTrajectoryHasBeenCreated(Trajectory trajectory)
        {
            var isTrajectoryCreated = false;
            var query = TrajectoryQueries.QueryById(trajectory.WellUid, trajectory.WellboreUid, trajectory.Uid);
            var maxRetries = 30;
            while (!isTrajectoryCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created trajectory with name {trajectory.Name} (id={trajectory.Uid})");
                }
                Thread.Sleep(1000);
                var trajectoryResult = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);
                isTrajectoryCreated = trajectoryResult.Trajectories.Any();
            }
        }

        private static WitsmlTrajectories SetupTrajectoryToCreate(Trajectory trajectory)
        {
            var tStations = trajectory.TrajectoryStations.Select(trajectoryStation => new WitsmlTrajectoryStation()
            {
                Uid = Guid.NewGuid().ToString(),
                DTimStn = trajectoryStation.DTimStn?.ToString("o"),
                TypeTrajStation = trajectoryStation.TypeTrajStation,
                Md = new WitsmlMeasuredDepthCoord { Uom = "m", Value = trajectoryStation.Md.ToString() },
                Tvd = new WitsmlWellVerticalDepthCoord { Uom = "m", Value = trajectoryStation.Tvd.ToString() },
                Incl = new WitsmlPlaneAngleMeasure { Uom="dega", Value = trajectoryStation.Incl.ToString()},
                Azi = new WitsmlPlaneAngleMeasure { Uom = "dega", Value = trajectoryStation.Azi.ToString() },
                DispNs = new WitsmlLengthMeasure { Uom = "m", Value = trajectoryStation.DispNs.ToString() },
                DispEw = new WitsmlLengthMeasure { Uom = "m", Value = trajectoryStation.Azi.ToString() },
                VertSect = new WitsmlLengthMeasure { Uom = "m", Value = trajectoryStation.VertSect.ToString() },
                Dls = new WitsmlAnglePerLengthMeasure{ Uom = "rad/m", Value = trajectoryStation.Dls.ToString() },
                CommonData = new WitsmlCommonData
                {
                    ItemState = trajectoryStation.CommonData.ItemState,
                    SourceName = trajectoryStation.CommonData.SourceName,
                    DTimCreation = trajectoryStation.CommonData.DTimCreation?.ToString("o"),
                    DTimLastChange = trajectoryStation.CommonData.DTimLastChange?.ToString("o"),
                },
            }).ToList();

            return new WitsmlTrajectories
            {
                Trajectories = new WitsmlTrajectory
                {
                    Uid = trajectory.Uid,
                    Name = trajectory.Name,
                    ServiceCompany = "Equinor",
                    NameWell = trajectory.NameWell,
                    NameWellbore = trajectory.NameWellbore,
                    UidWell = trajectory.WellUid,
                    UidWellbore = trajectory.WellboreUid,
                    CommonData = new WitsmlCommonData
                    {
                        ItemState = trajectory.CommonData.ItemState,
                        SourceName = trajectory.CommonData.SourceName,
                        DTimCreation = trajectory.CommonData.DTimCreation?.ToString("o"),
                        DTimLastChange = trajectory.CommonData.DTimLastChange?.ToString("o"),
                    },
                    TrajectoryStations = tStations
                }.AsSingletonList()
            };
        }

        private void Verify(Trajectory trajectory)
        {
            if (string.IsNullOrEmpty(trajectory.Uid)) throw new InvalidOperationException($"{nameof(trajectory.Uid)} cannot be empty");
            if (string.IsNullOrEmpty(trajectory.Name)) throw new InvalidOperationException($"{nameof(trajectory.Name)} cannot be empty");
        }
    }
}
