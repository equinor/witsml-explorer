using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class MessageHandler

    {
        [Produces(typeof(IEnumerable<MessageObject>))]
        public static async Task<IResult> GetMessages(string wellUid, string wellboreUid, IMessageObjectService messageService)
        {
            return TypedResults.Ok(await messageService.GetMessageObjects(wellUid, wellboreUid));
        }
        [Produces(typeof(MessageObject))]
        public static async Task<IResult> GetMessage(string wellUid, string wellboreUid, string messageUid, IMessageObjectService messageService)
        {
            return TypedResults.Ok(await messageService.GetMessageObject(wellUid, wellboreUid, messageUid));
        }
    }
}
