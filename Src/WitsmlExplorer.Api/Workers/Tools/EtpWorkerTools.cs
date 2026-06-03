using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ETP;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services.ETP;

namespace WitsmlExplorer.Api.Workers
{
    public static class EtpWorkerTools
    {
        public static async Task<WitsmlWell> GetWell(IEtpClient etpClient, WellReference wellReference, CancellationToken? cancellationToken = null)
        {
            var uri = EtpUriHelper.CreateWellUri(wellReference.WellUid);
            WitsmlWells wells = await etpClient.GetObjectAsWitsmlAsync<WitsmlWells>(uri, cancellationToken ?? CancellationToken.None);
            return !wells.Wells.Any() ? null : wells.Wells.First();
        }

        public static async Task<WitsmlWellbore> GetWellbore(IEtpClient etpClient, WellboreReference wellboreReference, CancellationToken? cancellationToken = null)
        {
            var uri = EtpUriHelper.CreateWellboreUri(wellboreReference.WellUid, wellboreReference.WellboreUid);
            WitsmlWellbores wellbores = await etpClient.GetObjectAsWitsmlAsync<WitsmlWellbores>(uri, cancellationToken ?? CancellationToken.None);
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
