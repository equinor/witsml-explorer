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
    public static class AttachmentHandler
    {
        [Produces(typeof(IEnumerable<Attachment>))]
        public static async Task<IResult> GetAttachments(HttpContext httpContext, string wellUid, string wellboreUid, IAttachmentService attachmentService, IEtpAttachmentService etpAttachmentService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<Attachment>> SoapCall() => attachmentService.GetAttachments(wellUid, wellboreUid);
            Task<ICollection<Attachment>> EtpCall() => etpAttachmentService.GetAttachments(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(Attachment))]
        public static async Task<IResult> GetAttachment(HttpContext httpContext, string wellUid, string wellboreUid, string attachmentUid, IAttachmentService attachmentService, IEtpAttachmentService etpAttachmentService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<Attachment> SoapCall() => attachmentService.GetAttachment(wellUid, wellboreUid, attachmentUid);
            Task<Attachment> EtpCall() => etpAttachmentService.GetAttachment(wellUid, wellboreUid, attachmentUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
