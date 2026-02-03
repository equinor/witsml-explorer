using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Models
{
    public class MnemonicsMapping : DbDocument<Guid>
    {
        public override string PartitionKeyValue => VendorName;

        public MnemonicsMapping(Guid id) : base(id)
        {
            VendorMnemonicNames = new List<string>();
        }

        public string VendorName { get; init; }
        public string GlobalMnemonicName { get; init; }
        public List<string> VendorMnemonicNames { get; init; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
