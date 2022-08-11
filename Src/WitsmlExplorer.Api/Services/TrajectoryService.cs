using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface ITrajectoryService
    {
        Task<IEnumerable<Trajectory>> GetTrajectories(string wellUid, string wellboreUid);
        Task<Trajectory> GetTrajectory(string wellUid, string wellboreUid, string trajectoryUid);

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
            var witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.Requested));
            return result.Trajectories.Select(trajectory =>
                WitsmlToTrajectory(trajectory)
                ).OrderBy(trajectory => trajectory.Name);
        }

        public async Task<Trajectory> GetTrajectory(string wellUid, string wellboreUid, string trajectoryUid)
        {
            var witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.All));

            if (result.Trajectories.Any())
            {
                return WitsmlToTrajectory(result.Trajectories.First());
            }

            return null;
        }

        public async Task<List<TrajectoryStation>> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid)
        {
            var trajectoryToQuery = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            var result = await WitsmlClient.GetFromStoreAsync(trajectoryToQuery, new OptionsIn(ReturnElements.All));
            var witsmlTrajectory = result.Trajectories.FirstOrDefault();
            if (witsmlTrajectory == null) return null;
            return witsmlTrajectory.TrajectoryStations.Select(tStation => new TrajectoryStation
            {
                Uid = tStation.Uid,
                DTimStn = StringHelpers.ToDateTime(tStation.DTimStn),
                TypeTrajStation = tStation.TypeTrajStation,
                Md = (tStation.Md == null) ? null : new LengthMeasure { Uom = tStation.Md.Uom, Value = StringHelpers.ToDecimal(tStation.Md.Value) },
                Tvd = (tStation.Tvd == null) ? null : new LengthMeasure { Uom = tStation.Tvd.Uom, Value = StringHelpers.ToDecimal(tStation.Tvd?.Value) },
                Incl = (tStation.Incl == null) ? null : new LengthMeasure { Uom = tStation.Incl.Uom, Value = StringHelpers.ToDecimal(tStation.Incl?.Value) },
                Azi = (tStation.Azi == null) ? null : new LengthMeasure { Uom = tStation.Azi.Uom, Value = StringHelpers.ToDecimal(tStation.Azi?.Value) }
            })
                .OrderBy(tStation => tStation.Md.Value)
                .ToList();
        }
        private static Trajectory WitsmlToTrajectory(WitsmlTrajectory trajectory)
        {
            return new Trajectory
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
            };
        }
    }
}
