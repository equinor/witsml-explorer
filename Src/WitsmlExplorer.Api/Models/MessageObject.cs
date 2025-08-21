using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class MessageObject : ObjectOnWellbore
    {
        public string DTim { get; set; }
        public string MessageText { get; init; }
        public string TypeMessage { get; init; }
        public MeasureWithDatum Md { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlMessages ToWitsml()
        {
            return new WitsmlMessage
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                DTim = StringHelpers.ToUniversalDateTimeString(DTim),
                Md = Md?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                MessageText = MessageText,
                TypeMessage = TypeMessage,
                CommonData = CommonData?.ToWitsml()
            }.AsItemInWitsmlList();
        }
    }
}
