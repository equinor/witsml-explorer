using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpAttachmentService
    {
        Task<Attachment> GetAttachment(string wellUid, string wellboreUid, string attachmentUid, CancellationToken? cancellationToken);
        Task<ICollection<Attachment>> GetAttachments(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
    }

    public class EtpAttachmentService : EtpService, IEtpAttachmentService
    {
        public EtpAttachmentService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<Attachment> GetAttachment(string wellUid, string wellboreUid, string attachmentUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Attachment, attachmentUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlAttachments>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return Attachment.FromWitsml(objList.Attachments.FirstOrDefault());
        }

        public async Task<ICollection<Attachment>> GetAttachments(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Attachment);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var attachments = resources.Select(MapResourceToAttachment).ToList();

            return attachments;
        }

        private Attachment MapResourceToAttachment(Resource resource)
        {
            return new Attachment
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.Attachment),
                Name = resource.name,
                WellboreUid = EtpUriHelper.GetWellboreUid(resource.uri),
                WellUid = EtpUriHelper.GetWellUid(resource.uri),
                CommonData = new CommonData
                {
                    DTimLastChange = ToUtcDateTimeLastChange(resource.lastChanged)
                }
            };
        }
    }
}
