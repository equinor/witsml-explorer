using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface ITrajectoryService
    {
        Task<ICollection<Trajectory>> GetTrajectories(string wellUid, string wellboreUid);
        Task<Trajectory> GetTrajectory(string wellUid, string wellboreUid, string trajectoryUid);
        Task<List<TrajectoryStation>> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid);
    }

    // ReSharper disable once UnusedMember.Global
    public class TrajectoryService : WitsmlService, ITrajectoryService
    {
        public TrajectoryService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<ICollection<Trajectory>> GetTrajectories(string wellUid, string wellboreUid)
        {
            WitsmlTrajectories witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryByWellbore(wellUid, wellboreUid);
            WitsmlTrajectories result = await _witsmlClient.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.Requested));
            return result.Trajectories.Select(Trajectory.FromWitsml).OrderBy(trajectory => trajectory.Name).ToList();
        }

        public async Task<Trajectory> GetTrajectory(string wellUid, string wellboreUid, string trajectoryUid)
        {
            WitsmlTrajectories witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            WitsmlTrajectories result = await _witsmlClient.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.All));

            return Trajectory.FromWitsml(result.Trajectories.FirstOrDefault());
        }

        public async Task<List<TrajectoryStation>> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid)
        {
            var trajectory = await GetTrajectory(wellUid, wellboreUid, trajectoryUid);
            return trajectory?.TrajectoryStations?.OrderBy(tStation => tStation.Md.Value).ToList();
        }
    }
}
