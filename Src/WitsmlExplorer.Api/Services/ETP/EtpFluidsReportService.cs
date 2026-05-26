using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpFluidsReportService
    {
        public Task<FluidsReport> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid, CancellationToken? cancellationToken);
        public Task<ICollection<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
        public Task<List<Fluid>> GetFluids(string wellUid, string wellboreUid, string fluidsReportUid, CancellationToken? cancellationToken);
    }

    public class EtpFluidsReportService : EtpService, IEtpFluidsReportService
    {
        public EtpFluidsReportService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<FluidsReport> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.FluidsReport, fluidsReportUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlFluidsReports>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return FluidsReport.FromWitsml(objList.FluidsReports.FirstOrDefault());
        }

        public async Task<ICollection<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.FluidsReport);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var fluidsReports = resources.Select(MapResourceToFluidsReport).ToList();

            return fluidsReports;
        }

        public async Task<List<Fluid>> GetFluids(string wellUid, string wellboreUid, string fluidsReportUid, CancellationToken? cancellationToken)
        {
            return (await GetFluidsReport(wellUid, wellboreUid, fluidsReportUid, cancellationToken))?.Fluids;
        }

        private FluidsReport MapResourceToFluidsReport(Resource resource)
        {
            return new FluidsReport
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.FluidsReport),
                Name = resource.name,
                WellboreUid = EtpUriHelper.GetWellboreUid(resource.uri),
                WellUid = EtpUriHelper.GetWellUid(resource.uri)
            };
        }
    }
}
