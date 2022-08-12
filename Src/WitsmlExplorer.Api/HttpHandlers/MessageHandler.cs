using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class MessageHandler
{
    public static async Task<IResult> GetMessages(string wellUid, string wellboreUid, IMessageObjectService messageService)
    {
        try
        {
            return Results.Ok(await messageService.GetMessageObjects(wellUid, wellboreUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
    public static async Task<IResult> GetMessage(string wellUid, string wellboreUid, string messageUid, IMessageObjectService messageService)
    {
        try
        {
            return Results.Ok(await messageService.GetMessageObject(wellUid, wellboreUid, messageUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
}
