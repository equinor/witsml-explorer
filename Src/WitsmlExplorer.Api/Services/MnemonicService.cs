using System;
using System.Threading.Tasks;

using Witsml;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IMnemonicService
    {
        Task<QueryResult> DeleteMnemonic(string wellUid, string wellboreUid, string logToCheckUid, LogCurveInfo mnemonicToDelete);
    }

    public class MnemonicService : WitsmlService, IMnemonicService
    {
        public MnemonicService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<QueryResult> DeleteMnemonic(string wellUid, string wellboreUid, string logToCheckUid, LogCurveInfo mnemonicToDelete)
        {
            var query = LogQueries.DeleteMnemonics(wellUid, wellboreUid, logToCheckUid, new[] { mnemonicToDelete.Mnemonic });

            return await _witsmlClient.DeleteFromStoreAsync(query);
        }
    }
}
