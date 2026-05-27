using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpLogService
    {
        Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken);
        Task<ICollection<LogObject>> GetLogs(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
        Task<ICollection<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken);
    }

    public class EtpLogService : EtpService, IEtpLogService
    {
        public EtpLogService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Log, logUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlLogs>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return LogObject.FromWitsml(objList.Logs.FirstOrDefault());
        }

        public async Task<ICollection<LogObject>> GetLogs(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Log);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            return resources.Select(MapResourceToLog).ToList();
        }

        public async Task<ICollection<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Log, logUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlLogs>(uri, cancellationToken ?? CancellationToken.None);
            var witsmlLog = objList?.Logs?.FirstOrDefault();
            return witsmlLog?.LogCurveInfo.Select(LogObject.LogCurveInfoFromWitsml).ToList();
        }

        private LogObject MapResourceToLog(Resource resource)
        {
            return new LogObject
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.Log),
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
