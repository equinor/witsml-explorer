using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Services.ETP;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class MessageHandler

    {
        [Produces(typeof(IEnumerable<MessageObject>))]
        public static async Task<IResult> GetMessages(HttpContext httpContext, string wellUid, string wellboreUid, IMessageObjectService messageService, IEtpMessageObjectService etpMessageService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<MessageObject>> SoapCall() => messageService.GetMessageObjects(wellUid, wellboreUid);
            Task<ICollection<MessageObject>> EtpCall() => etpMessageService.GetMessageObjects(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
        [Produces(typeof(MessageObject))]
        public static async Task<IResult> GetMessage(HttpContext httpContext, string wellUid, string wellboreUid, string messageUid, IMessageObjectService messageService, IEtpMessageObjectService etpMessageService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<MessageObject> SoapCall() => messageService.GetMessageObject(wellUid, wellboreUid, messageUid);
            Task<MessageObject> EtpCall() => etpMessageService.GetMessageObject(wellUid, wellboreUid, messageUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
