using Witsml.Data;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public static class AttachmentQueries
    {
        public static WitsmlAttachments GetWitsmlAttachment(string wellUid, string wellboreUid, string attachmentUid = "")
        {
            return new WitsmlAttachments
            {
                Attachments = new WitsmlAttachment
                {
                    Uid = attachmentUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    NameWell = "",
                    NameWellbore = "",
                    Name = "",
                    FileName = "",
                    Description = "",
                    FileType = "",
                    Content = "",
                    CommonData = new WitsmlCommonData()
                    {
                        ItemState = "",
                        SourceName = "",
                        DTimLastChange = "",
                        DTimCreation = "",
                        ServiceCategory = "",
                        Comments = "",
                        DefaultDatum = "",
                    }
                }.AsItemInList()
            };
        }

        public static WitsmlAttachments QueryById(string wellUid, string wellboreUid, string attachmentUid)
        {
            return new WitsmlAttachments()
            {
                Attachments = new WitsmlAttachment
                {
                    Uid = attachmentUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsItemInList()
            };
        }
    }
}
