using Witsml.Data;
using Witsml.Extensions;

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
                    Uid = messageUid
                }.AsItemInList()
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
                    NameWellbore = "",
                    NameWell = "",
                    Uid = "",
                    Name = "",
                    MessageText = "",
                    TypeMessage = "",
                    DTim = "",
                    CommonData = new WitsmlCommonData()
                    {
                        SourceName = "",
                        DTimCreation = "",
                        DTimLastChange = "",
                        Comments = ""
                    }
                }.AsItemInList()
            };
        }
    }
}
