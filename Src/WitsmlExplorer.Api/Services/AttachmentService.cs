using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IAttachmentService
    {
        Task<Attachment> GetAttachment(string wellUid, string wellboreUid, string attachmentUid);
        Task<ICollection<Attachment>> GetAttachments(string wellUid, string wellboreUid);
    }

    public class AttachmentService : WitsmlService, IAttachmentService
    {
        public AttachmentService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<Attachment> GetAttachment(string wellUid, string wellboreUid, string attachmentUid)
        {
            WitsmlAttachments query = AttachmentQueries.GetWitsmlAttachment(wellUid, wellboreUid, attachmentUid);
            WitsmlAttachments result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            return Attachment.FromWitsml(result.Attachments.FirstOrDefault());
        }
        public async Task<ICollection<Attachment>> GetAttachments(string wellUid, string wellboreUid)
        {
            WitsmlAttachments witsmlAttachments = AttachmentQueries.GetWitsmlAttachment(wellUid, wellboreUid);
            WitsmlAttachments result = await _witsmlClient.GetFromStoreAsync(witsmlAttachments, new OptionsIn(ReturnElements.Requested));
            return result.Attachments.Select(Attachment.FromWitsml).OrderBy(attachment => attachment.Name).ToList();
        }
    }
}
