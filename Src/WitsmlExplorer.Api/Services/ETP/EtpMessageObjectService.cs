using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpMessageObjectService
    {
        Task<MessageObject> GetMessageObject(string wellUid, string wellboreUid, string messageUid, CancellationToken? cancellationToken);
        Task<ICollection<MessageObject>> GetMessageObjects(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
    }

    public class EtpMessageObjectService : EtpService, IEtpMessageObjectService
    {
        public EtpMessageObjectService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<MessageObject> GetMessageObject(string wellUid, string wellboreUid, string messageUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Message, messageUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlMessages>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return MessageObject.FromWitsml(objList.Messages.FirstOrDefault());
        }

        public async Task<ICollection<MessageObject>> GetMessageObjects(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Message);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var messages = resources.Select(MapResourceToMessageObject).ToList();

            return messages;
        }

        private MessageObject MapResourceToMessageObject(Resource resource)
        {
            return new MessageObject
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.Message),
                Name = resource.name,
                WellboreUid = EtpUriHelper.GetWellboreUid(resource.uri),
                WellUid = EtpUriHelper.GetWellUid(resource.uri)
            };
        }
    }
}
