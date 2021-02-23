using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services
{
    public interface ITrajectoryService
    {
        Task<IEnumerable<Trajectory>> GetTrajectories(string wellUid, string wellboreUid);
        Task<List<TrajectoryStation>> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid);
    }

    // ReSharper disable once UnusedMember.Global
    public class TrajectoryService : WitsmlService, ITrajectoryService
    {
        public TrajectoryService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<IEnumerable<Trajectory>> GetTrajectories(string wellUid, string wellboreUid)
        {
            var query = TrajectoryQueries.QueryByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.Requested);

            return result.Trajectories.Select(trajectory =>
                new Trajectory
                {
                    Uid = trajectory.Uid,
                    WellUid = trajectory.UidWell,
                    WellboreUid = trajectory.UidWellbore,
                    Name = trajectory.Name,
                    MdMin = StringHelpers.ToDecimal(trajectory.MdMin?.Value),
                    MdMax = StringHelpers.ToDecimal(trajectory.MdMax?.Value),
                    AziRef = trajectory.AziRef,
                    DTimTrajStart = StringHelpers.ToDateTime(trajectory.DTimTrajStart),
                    DTimTrajEnd = StringHelpers.ToDateTime(trajectory.DTimTrajEnd),
                    DateTimeCreation = StringHelpers.ToDateTime(trajectory.CommonData?.DTimCreation),
                    DateTimeLastChange = StringHelpers.ToDateTime(trajectory.CommonData?.DTimLastChange)
                }).OrderBy(trajectory => trajectory.Name);
        }

        public async Task<List<TrajectoryStation>> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid)
        {
            var query = TrajectoryQueries.QueryById(wellUid, wellboreUid, trajectoryUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.All);
            var witsmlTrajectory = result.Trajectories.FirstOrDefault();
            if (witsmlTrajectory == null) return null;
            return witsmlTrajectory.TrajectoryStations.Select(tStation => new TrajectoryStation
                {
                    Uid = tStation.Uid,
                    DTimStn = StringHelpers.ToDateTime(tStation.DTimStn),
                    TypeTrajStation = tStation.TypeTrajStation,
                    Md = StringHelpers.ToDecimal(tStation.Md?.Value),
                    Tvd = StringHelpers.ToDecimal(tStation.Tvd?.Value),
                    Incl = StringHelpers.ToDecimal(tStation.Incl?.Value),
                    Azi = StringHelpers.ToDecimal(tStation.Azi?.Value)
                })
                .OrderBy(tStation => tStation.Md)
                .ToList();
        }
    }
}
