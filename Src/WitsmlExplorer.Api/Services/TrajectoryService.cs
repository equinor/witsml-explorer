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
            return result.Trajectories.Select(WitsmlToTrajectory
                ).OrderBy(trajectory => trajectory.Name).ToList();
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
                Md = LengthMeasure.FromWitsml(tStation.Md),
                Tvd = LengthMeasure.FromWitsml(tStation.Tvd),
                Incl = LengthMeasure.FromWitsml(tStation.Incl),
                Azi = LengthMeasure.FromWitsml(tStation.Azi),
                Dls = LengthMeasure.FromWitsml(tStation.Dls),
                Mtf = LengthMeasure.FromWitsml(tStation.Mtf),
                Gtf = LengthMeasure.FromWitsml(tStation.Gtf),
                DispNs = LengthMeasure.FromWitsml(tStation.DispNs),
                DispEw = LengthMeasure.FromWitsml(tStation.DispEw),
                VertSect = LengthMeasure.FromWitsml(tStation.VertSect),
                RateTurn = LengthMeasure.FromWitsml(tStation.RateTurn),
                RateBuild = LengthMeasure.FromWitsml(tStation.RateBuild),
                GravTotalUncert = LengthMeasure.FromWitsml(tStation.GravTotalUncert),
                DipAngleUncert = LengthMeasure.FromWitsml(tStation.DipAngleUncert),
                MagTotalUncert = LengthMeasure.FromWitsml(tStation.MagTotalUncert),
                SagCorUsed = tStation.SagCorUsed,
                MagDrlstrCorUsed = tStation.MagDrlstrCorUsed,
                GravTotalFieldReference = LengthMeasure.FromWitsml(tStation.GravTotalFieldReference),
                MagTotalFieldReference = LengthMeasure.FromWitsml(tStation.MagTotalFieldReference),
                MagDipAngleReference = LengthMeasure.FromWitsml(tStation.MagDipAngleReference),
                StatusTrajStation = tStation.StatusTrajStation,
                GravAxialRaw = LengthMeasure.FromWitsml(tStation.GravAxialRaw),
                GravTran1Raw = LengthMeasure.FromWitsml(tStation.GravTran1Raw),
                GravTran2Raw = LengthMeasure.FromWitsml(tStation.GravTran2Raw),
                MagAxialRaw = LengthMeasure.FromWitsml(tStation.MagAxialRaw),
                RawData =
                        new TrajRawData()
                        {
                            MagTran1Raw = LengthMeasure.FromWitsml(tStation.RawData?.MagTran1Raw),
                            MagTran2Raw = LengthMeasure.FromWitsml(tStation.RawData?.MagTran2Raw)
                        },
                CorUsed = new StnTrajCorUsed()
                {
                    GravAxialAccelCor = LengthMeasure.FromWitsml(tStation.CorUsed?.GravAxialAccelCor),
                    GravTran1AccelCor = LengthMeasure.FromWitsml(tStation.CorUsed?.GravTran1AccelCor),
                    GravTran2AccelCor = LengthMeasure.FromWitsml(tStation.CorUsed?.GravTran2AccelCor),
                    MagAxialDrlstrCor = LengthMeasure.FromWitsml(tStation.CorUsed?.MagAxialDrlstrCor),
                    MagTran1DrlstrCor = LengthMeasure.FromWitsml(tStation.CorUsed?.MagTran1DrlstrCor),
                    MagTran2DrlstrCor = LengthMeasure.FromWitsml(tStation.CorUsed?.MagTran2DrlstrCor),
                    SagIncCor = LengthMeasure.FromWitsml(tStation.CorUsed?.SagIncCor),
                    StnMagDeclUsed = LengthMeasure.FromWitsml(tStation.CorUsed?.StnMagDeclUsed),
                    StnGridCorUsed = LengthMeasure.FromWitsml(tStation.CorUsed?.StnGridCorUsed),
                    DirSensorOffset = LengthMeasure.FromWitsml(tStation.CorUsed?.DirSensorOffset)
                },
                Valid = new StnTrajValid()
                {
                    MagTotalFieldCalc = LengthMeasure.FromWitsml(tStation.Valid?.MagTotalFieldCalc),
                    MagDipAngleCalc = LengthMeasure.FromWitsml(tStation.Valid?.MagDipAngleCalc),
                    GravTotalFieldCalc = LengthMeasure.FromWitsml(tStation.Valid?.GravTotalFieldCalc)
                },
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
                MdMin = MeasureWithDatum.FromWitsml(trajectory.MdMin),
                MdMax = MeasureWithDatum.FromWitsml(trajectory.MdMax),
                AziRef = trajectory.AziRef,
                DTimTrajStart = trajectory.DTimTrajStart,
                DTimTrajEnd = trajectory.DTimTrajEnd,
                ServiceCompany = trajectory.ServiceCompany,
                CommonData = new CommonData()
                {
                    ItemState = trajectory.CommonData?.ItemState,
                    SourceName = trajectory.CommonData?.SourceName,
                    DTimLastChange = trajectory.CommonData?.DTimLastChange,
                    DTimCreation = trajectory.CommonData?.DTimCreation,
                }
            };
        }
    }
}
