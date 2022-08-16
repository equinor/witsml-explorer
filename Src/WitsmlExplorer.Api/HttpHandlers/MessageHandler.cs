using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class MessageHandler
{
    public static async Task<IResult> GetMessages(string wellUid, string wellboreUid, IMessageObjectService messageService)
    {
        return Results.Ok(await messageService.GetMessageObjects(wellUid, wellboreUid));
    }
    public static async Task<IResult> GetMessage(string wellUid, string wellboreUid, string messageUid, IMessageObjectService messageService)
    {
        return Results.Ok(await messageService.GetMessageObject(wellUid, wellboreUid, messageUid));
    }
}
