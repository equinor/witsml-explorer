using System.Collections;
using System.Collections.Generic;

using Microsoft.AspNetCore.Http.Features;

namespace WitsmlExplorer.Api.Models
{
    public class MnemonicsMappingsQuery
    {
        public MnemonicsMappingsQuery()
        {
            SourceVendors = new List<string>();
            SourceVendorsMnemonics = new List<string>();
        }

        public ICollection<string> SourceVendors { get; init; }
        public ICollection<string> SourceVendorsMnemonics { get; init; }
        public bool ReturnGlobalMnemonics { get; init; }
    }

    public class MnemonicsMappingsQueryResult
    {
        public MnemonicsMappingsQueryResult()
        {
            Mappings = new List<MnemonicsMappingsResultItem>();
        }

        public ICollection<MnemonicsMappingsResultItem> Mappings { get; init; }
    }
    public class MnemonicsMappingsResultItem
    {
        public string Vendor { get; init; }
        public string GlobalMnemonicName { get; init; }
        public string VendorMnemonicName { get; init; }
    }
}
