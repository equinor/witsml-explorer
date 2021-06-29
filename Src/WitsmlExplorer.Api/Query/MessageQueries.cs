using Witsml.Data;
using Witsml.Extensions;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public class MessageQueries
    {
        public static WitsmlMessages GetMessageById(string wellUid, string wellboreUid, string messageUid)
        {
            return new WitsmlMessages
            {
                Messages = new WitsmlMessage
                {
                    UidWellbore = wellboreUid,
                    UidWell = wellUid,
                    Uid = messageUid,
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }

        public static WitsmlMessages GetMessageByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlMessages
            {
                Messages = new WitsmlMessage
                {
                    UidWellbore = wellboreUid,
                    UidWell = wellUid,
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }

        public static WitsmlMessages CreateMessageObject(MessageObject messageObject, WitsmlWellbore targetWellbore)
        {
            return new WitsmlMessages
            {
                Messages = new WitsmlMessage
                {
                    UidWell = targetWellbore.UidWell,
                    NameWell = targetWellbore.NameWell,
                    UidWellbore = targetWellbore.Uid,
                    NameWellbore = targetWellbore.Name,
                    Uid = messageObject.Uid,
                    Name = messageObject.Name,
                    MessageText = messageObject.MessageText
                }.AsSingletonList()
            };
        }
    }
}
