using Witsml.Data.Tubular;

namespace WitsmlExplorer.Api.Models
{
    public class Tubular : ObjectOnWellbore
    {
        public string TypeTubularAssy { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlTubulars ToWitsml()
        {
            return new WitsmlTubular
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                TypeTubularAssy = TypeTubularAssy,
                CommonData = CommonData?.ToWitsml(),
            }.AsItemInWitsmlList();
        }
    }
}
