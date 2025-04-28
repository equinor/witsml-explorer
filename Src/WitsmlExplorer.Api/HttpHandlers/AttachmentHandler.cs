using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class AttachmentHandler
    {
        [Produces(typeof(IEnumerable<Attachment>))]
        public static async Task<IResult> GetAttachments(string wellUid, string wellboreUid, IAttachmentService attachmentService)
        {
            return TypedResults.Ok(await attachmentService.GetAttachments(wellUid, wellboreUid));

        }
        [Produces(typeof(Attachment))]
        public static async Task<IResult> GetAttachment(string wellUid, string wellboreUid, string attachmentUid, IAttachmentService attachmentService)
        {
            return TypedResults.Ok(await attachmentService.GetAttachment(wellUid, wellboreUid, attachmentUid));
        }
    }
}
