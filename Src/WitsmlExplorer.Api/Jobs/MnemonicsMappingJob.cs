using System.Collections.Generic;

using Microsoft.AspNetCore.Http;

namespace WitsmlExplorer.Api.Jobs
{
    public record MnemonicsMappingJob : Job
    {
        public string VendorName { get; init; }
        public bool Overwrite { get; init; }
        public IList<IList<string>> Mappings { get; init; }
        public override bool IsCancelable => true;
        public override string Description()
        {
            return $"Mnemonics Mapping " +
                $"- Vendor Name: {VendorName}" +
                $" Overwrite: {Overwrite}" +
                $" Mappings Count: {Mappings.Count}";
        }

        public override string GetObjectName()
        {
            return VendorName;
        }

        public override string GetWellboreName()
        {
            return null;
        }

        public override string GetWellName()
        {
            return null;
        }
    }
}
