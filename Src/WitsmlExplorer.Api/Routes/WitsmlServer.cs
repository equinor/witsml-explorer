using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Routez;

public static class WitsmlServer
{
    public static async Task<IResult> GetWitsmlServers(IDocumentRepository<Server, Guid> witsmlServerRepository)
    {
        try
        {
            var servers = await witsmlServerRepository.GetDocumentsAsync();
            return Results.Ok(servers);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
    public static async Task<IResult> CreateWitsmlServer(Server witsmlServer, IDocumentRepository<Server, Guid> witsmlServerRepository)
    {
        try
        {
            var inserted = await witsmlServerRepository.CreateDocumentAsync(witsmlServer);
            return Results.Ok(inserted);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    public static async Task<IResult> UpdateWitsmlServer(Guid witsmlServerId, Server witsmlServer, IDocumentRepository<Server, Guid> witsmlServerRepository)
    {
        try
        {
            var updatedServer = await witsmlServerRepository.UpdateDocumentAsync(witsmlServerId, witsmlServer);
            return Results.Ok(updatedServer);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    public static async Task<IResult> DeleteWitsmlServer(Guid witsmlServerId, IDocumentRepository<Server, Guid> witsmlServerRepository)
    {
        try
        {
            await witsmlServerRepository.DeleteDocumentAsync(witsmlServerId);
            return Results.NoContent();
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
}
