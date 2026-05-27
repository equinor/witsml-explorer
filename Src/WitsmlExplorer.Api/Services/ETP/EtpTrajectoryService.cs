using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpTrajectoryService
    {
        Task<Trajectory> GetTrajectory(string wellUid, string wellboreUid, string trajectoryUid, CancellationToken? cancellationToken);
        Task<ICollection<Trajectory>> GetTrajectories(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
        Task<List<TrajectoryStation>> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid, CancellationToken? cancellationToken);
    }

    public class EtpTrajectoryService : EtpService, IEtpTrajectoryService
    {
        public EtpTrajectoryService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<Trajectory> GetTrajectory(string wellUid, string wellboreUid, string trajectoryUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Trajectory, trajectoryUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlTrajectories>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return Trajectory.FromWitsml(objList.Trajectories.FirstOrDefault());
        }

        public async Task<ICollection<Trajectory>> GetTrajectories(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Trajectory);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var trajectories = resources.Select(MapResourceToTrajectory).ToList();

            return trajectories;
        }

        public Task<List<TrajectoryStation>> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid, CancellationToken? cancellationToken)
        {
            throw new NotImplementedException("TrajectoryStations are not returned in the Trajectory response. Implement this when EtpClient supports protocol 6 for GrowingObjects.");
        }

        private Trajectory MapResourceToTrajectory(Resource resource)
        {
            return new Trajectory
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.Trajectory),
                Name = resource.name,
                WellboreUid = EtpUriHelper.GetWellboreUid(resource.uri),
                WellUid = EtpUriHelper.GetWellUid(resource.uri),
                CommonData = new CommonData
                {
                    DTimLastChange = ToUtcDateTimeLastChange(resource.lastChanged)
                }
            };
        }
    }
}
