using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Services
{
    public interface IMnemonicsMappingService
    {
        Task<MnemonicsMappingsQueryResult> QueryMnemonicsMapping(MnemonicsMappingsQuery query);
    }

    public class MnemonicsMappingService : WitsmlService, IMnemonicsMappingService
    {
        private readonly IDocumentRepository<MnemonicsMapping, Guid> _mappingRepository;

        public MnemonicsMappingService(
            IDocumentRepository<MnemonicsMapping, Guid> mappingRepository,
            IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
            _mappingRepository = mappingRepository;
        }

        public async Task<MnemonicsMappingsQueryResult> QueryMnemonicsMapping(MnemonicsMappingsQuery query)
        {
            var result = new MnemonicsMappingsQueryResult();
            ICollection<MnemonicsMapping> globalMappings;

            if (!query.SourceVendors.IsNullOrEmpty())
            {
                globalMappings = await _mappingRepository.GetDocumentsAsync(d => query.SourceVendors.Any(v => v.Equals(d.VendorName, StringComparison.OrdinalIgnoreCase)));

                if (!query.SourceVendorsMnemonics.IsNullOrEmpty())
                {
                    globalMappings = globalMappings
                        .Where(m => m.VendorMnemonicNames.Any(vmn => query.SourceVendorsMnemonics.Any(vm => vm.Equals(vmn, StringComparison.OrdinalIgnoreCase))))
                        .ToList();
                }
            }
            else
            {
                globalMappings = await _mappingRepository.GetDocumentsAsync(d => query.SourceVendorsMnemonics.Any(vm => d.VendorMnemonicNames.Any(dvm => dvm.Equals(vm, StringComparison.OrdinalIgnoreCase))));

            }

            if (!globalMappings.IsNullOrEmpty())
            {
                if (query.ReturnGlobalMnemonics)
                {
                    result = ExtractMnemonicsMappingsQueryResult(globalMappings);
                }
                else
                {
                    var globalMnemonics = globalMappings.Select(gm => gm.GlobalMnemonicName);
                    var vendorMappings = await _mappingRepository.GetDocumentsAsync(d => globalMnemonics.Any(gm => gm.Equals(d.GlobalMnemonicName, StringComparison.OrdinalIgnoreCase)));

                    result = ExtractMnemonicsMappingsQueryResult(vendorMappings);
                }
            }

            return result;
        }

        private MnemonicsMappingsQueryResult ExtractMnemonicsMappingsQueryResult(ICollection<MnemonicsMapping> globalMappings)
        {
            var result = new MnemonicsMappingsQueryResult();

            foreach (var mapping in globalMappings)
            {
                foreach (var vendorMnemonic in mapping.VendorMnemonicNames)
                {
                    result.Mappings.Add(new MnemonicsMappingsResultItem
                    {
                        Vendor = mapping.VendorName,
                        VendorMnemonicName = vendorMnemonic,
                        GlobalMnemonicName = mapping.GlobalMnemonicName,
                    });
                }
            }

            return result;
        }
    }
}
