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

        public static MessageObject FromWitsml(WitsmlMessage message)
        {
            return message == null ? null : new MessageObject
            {
                WellboreUid = message.UidWellbore,
                WellboreName = message.NameWellbore,
                WellUid = message.UidWell,
                WellName = message.NameWell,
                Uid = message.Uid,
                Name = message.Name,
                Md = MeasureWithDatum.FromWitsml(message.Md),
                MessageText = message.MessageText,
                TypeMessage = message.TypeMessage,
                DTim = message.DTim,
                CommonData = new()
                {
                    SourceName = message.CommonData?.SourceName,
                    Comments = message.CommonData?.Comments,
                    DTimCreation = message.CommonData?.DTimCreation,
                    DTimLastChange = message.CommonData?.DTimLastChange
                }
            };
        }
    }
}
