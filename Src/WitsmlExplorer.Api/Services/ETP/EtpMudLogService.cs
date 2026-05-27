using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data.MudLog;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpMudLogService
    {
        Task<MudLog> GetMudLog(string wellUid, string wellboreUid, string mudlogUid, CancellationToken? cancellationToken);
        Task<ICollection<MudLog>> GetMudLogs(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
        Task<List<MudLogGeologyInterval>> GetGeologyIntervals(string wellUid, string wellboreUid, string mudlogUid, CancellationToken? cancellationToken);
    }

    public class EtpMudLogService : EtpService, IEtpMudLogService
    {
        public EtpMudLogService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<MudLog> GetMudLog(string wellUid, string wellboreUid, string mudlogUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.MudLog, mudlogUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlMudLogs>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return MudLog.FromWitsml(objList.MudLogs.FirstOrDefault());
        }

        public async Task<ICollection<MudLog>> GetMudLogs(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.MudLog);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var mudLogs = resources.Select(MapResourceToMudLog).ToList();

            return mudLogs;
        }

        public async Task<List<MudLogGeologyInterval>> GetGeologyIntervals(string wellUid, string wellboreUid, string mudlogUid, CancellationToken? cancellationToken)
        {
            return (await GetMudLog(wellUid, wellboreUid, mudlogUid, cancellationToken))?.GeologyInterval;
        }

        private MudLog MapResourceToMudLog(Resource resource)
        {
            return new MudLog
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.MudLog),
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
