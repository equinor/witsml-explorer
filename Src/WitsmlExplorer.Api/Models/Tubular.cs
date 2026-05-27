using System.Collections.Generic;
using System.Linq;

using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Models.Measure;

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

        public static Tubular FromWitsml(WitsmlTubular tubular)
        {
            return tubular == null ? null : new Tubular
            {
                Uid = tubular.Uid,
                WellUid = tubular.UidWell,
                WellboreUid = tubular.UidWellbore,
                Name = tubular.Name,
                WellName = tubular.NameWell,
                WellboreName = tubular.NameWellbore,
                TypeTubularAssy = tubular.TypeTubularAssy,
                CommonData = tubular.CommonData == null ? null : new CommonData
                {
                    DTimCreation = tubular.CommonData.DTimCreation,
                    DTimLastChange = tubular.CommonData.DTimLastChange,
                }
            };
        }

        public static List<TubularComponent> GetTubularComponents(List<WitsmlTubularComponent> tubularComponents)
        {
            return tubularComponents?.Select(tComponent => new TubularComponent
            {
                Uid = tComponent.Uid,
                TypeTubularComponent = tComponent.TypeTubularComp,
                Sequence = tComponent.Sequence,
                Description = tComponent.Description,
                Id = LengthMeasure.FromWitsml(tComponent.Id),
                Od = LengthMeasure.FromWitsml(tComponent.Od),
                Len = LengthMeasure.FromWitsml(tComponent.Len),
                NumJointStand = tComponent.NumJointStand,
                WtPerLen = LengthMeasure.FromWitsml(tComponent.WtPerLen),
                ConfigCon = tComponent.ConfigCon,
                TypeMaterial = tComponent.TypeMaterial,
                Vendor = tComponent.Vendor,
                Model = tComponent.Model
            }).OrderBy(tComponent => tComponent.Sequence).ToList();
        }
    }
}
