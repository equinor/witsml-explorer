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
            WitsmlTrajectories witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryByWellbore(wellUid, wellboreUid);
            WitsmlTrajectories result = await _witsmlClient.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.Requested));
            return result.Trajectories.Select(WitsmlToTrajectory
                ).OrderBy(trajectory => trajectory.Name);
        }

        public async Task<Trajectory> GetTrajectory(string wellUid, string wellboreUid, string trajectoryUid)
        {
            WitsmlTrajectories witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            WitsmlTrajectories result = await _witsmlClient.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.All));

            return result.Trajectories.Any() ? WitsmlToTrajectory(result.Trajectories.First()) : null;
        }

        public async Task<List<TrajectoryStation>> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid)
        {
            WitsmlTrajectories trajectoryToQuery = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            WitsmlTrajectories result = await _witsmlClient.GetFromStoreAsync(trajectoryToQuery, new OptionsIn(ReturnElements.All));
            WitsmlTrajectory witsmlTrajectory = result.Trajectories.FirstOrDefault();
            return witsmlTrajectory?.TrajectoryStations.Select(tStation => new TrajectoryStation
            {
                Uid = tStation.Uid,
                DTimStn = tStation.DTimStn,
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
                WellName = trajectory.NameWell,
                WellboreName = trajectory.NameWellbore,
                MdMin = (trajectory.MdMin == null) ? null : StringHelpers.ToDecimal(trajectory.MdMin.Value),
                MdMax = (trajectory.MdMax == null) ? null : StringHelpers.ToDecimal(trajectory.MdMax.Value),
                AziRef = trajectory.AziRef,
                DTimTrajStart = trajectory.DTimTrajStart,
                DTimTrajEnd = trajectory.DTimTrajEnd,
                ServiceCompany = trajectory.ServiceCompany,
                DateTimeCreation = trajectory.CommonData?.DTimCreation,
                DateTimeLastChange = trajectory.CommonData?.DTimLastChange
            };
        }
    }
}
