using Witsml.Data;

namespace WitsmlExplorer.Api.Models
{
    public class Attachment : ObjectOnWellbore
    {
        public string FileName { get; set; }
        public string Description { get; set; }
        public string FileType { get; set; }
        public string Content { get; set; }
        public CommonData CommonData { get; set; }
        public override WitsmlAttachments ToWitsml()
        {
            return new WitsmlAttachment
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                FileName = FileName,
                Description = Description,
                FileType = FileType,
                Content = Content,
                CommonData = CommonData?.ToWitsml()
            }.AsItemInWitsmlList();
        }

        public static Attachment FromWitsml(WitsmlAttachment attachment)
        {
            return attachment == null ? null : new Attachment
            {
                Uid = attachment.Uid,
                Name = attachment.Name,
                WellUid = attachment.UidWell,
                WellName = attachment.NameWell,
                WellboreName = attachment.NameWellbore,
                WellboreUid = attachment.UidWellbore,
                FileName = attachment.FileName,
                Description = attachment.Description,
                FileType = attachment.FileType,
                Content = attachment.Content,
                CommonData = new CommonData()
                {
                    ItemState = attachment.CommonData?.ItemState,
                    SourceName = attachment.CommonData?.SourceName,
                    DTimLastChange = attachment.CommonData?.DTimLastChange,
                    DTimCreation = attachment.CommonData?.DTimCreation,
                    ServiceCategory = attachment.CommonData?.ServiceCategory,
                    Comments = attachment.CommonData?.Comments,
                    DefaultDatum = attachment.CommonData?.DefaultDatum,
                }
            };
        }
    }
}
