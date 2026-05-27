using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpRiskService
    {
        Task<Risk> GetRisk(string wellUid, string wellboreUid, string riskUid, CancellationToken? cancellationToken);
        Task<ICollection<Risk>> GetRisks(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
    }

    public class EtpRiskService : EtpService, IEtpRiskService
    {
        public EtpRiskService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<Risk> GetRisk(string wellUid, string wellboreUid, string riskUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Risk, riskUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlRisks>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return Risk.FromWitsml(objList.Risks.FirstOrDefault());
        }

        public async Task<ICollection<Risk>> GetRisks(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Risk);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var risks = resources.Select(MapResourceToRisk).ToList();

            return risks;
        }

        private Risk MapResourceToRisk(Resource resource)
        {
            return new Risk
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.Risk),
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
