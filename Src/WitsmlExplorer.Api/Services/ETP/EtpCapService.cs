using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

using Witsml.ETP;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpCapService
    {
        Task<EtpServerCapabilities> GetCap(CancellationToken? cancellationToken);
        Task<IList<string>> GetCapObjects(CancellationToken? cancellationToken);
    }

    public class EtpCapService : EtpService, IEtpCapService
    {
        private static readonly Regex ObjectTypeRegex = new(@"(?:^|;)type=(?<type>[^;]+)", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

        public EtpCapService(IEtpClientProvider etpClientProvider) : base(etpClientProvider) { }

        public async Task<EtpServerCapabilities> GetCap(CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            return client.GetServerCapabilities();
        }

        public async Task<IList<string>> GetCapObjects(CancellationToken? cancellationToken)
        {
            var cap = await GetCap(cancellationToken);
            return cap.SupportedObjects
                .Where(o => o.Contains("version=1.4.1.1"))
                .Select(o => ObjectTypeRegex.Match(o))
                .Where(match => match.Success)
                .Select(match => match.Groups["type"].Value)
                .ToList();
        }
    }
}
