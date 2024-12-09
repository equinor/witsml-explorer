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
    }
}
