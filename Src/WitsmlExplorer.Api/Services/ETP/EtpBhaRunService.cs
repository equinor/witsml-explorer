using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpBhaRunService
    {
        public Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string bhaRunUid, CancellationToken? cancellationToken);
        public Task<ICollection<BhaRun>> GetBhaRuns(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
    }

    public class EtpBhaRunService : EtpService, IEtpBhaRunService
    {
        public EtpBhaRunService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string bhaRunUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.BhaRun, bhaRunUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlBhaRuns>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }
            var bhaRun = BhaRun.FromWitsml(objList.BhaRuns.FirstOrDefault());

            return bhaRun;
        }

        public async Task<ICollection<BhaRun>> GetBhaRuns(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.BhaRun);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var bhaRuns = resources.Select(MapResourceToBhaRun).ToList();

            return bhaRuns;
        }

        private BhaRun MapResourceToBhaRun(Resource resource)
        {
            return new BhaRun
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.BhaRun),
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
