using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.HttpHandler;

public static class WitsmlServerHandler
{
    public static async Task<IResult> GetWitsmlServers(IDocumentRepository<Server, Guid> witsmlServerRepository)
    {
        var servers = await witsmlServerRepository.GetDocumentsAsync();
        return Results.Ok(servers);
    }
    public static async Task<IResult> CreateWitsmlServer(Server witsmlServer, IDocumentRepository<Server, Guid> witsmlServerRepository)
    {
        var inserted = await witsmlServerRepository.CreateDocumentAsync(witsmlServer);
        return Results.Ok(inserted);
    }

    public static async Task<IResult> UpdateWitsmlServer(Guid witsmlServerId, Server witsmlServer, IDocumentRepository<Server, Guid> witsmlServerRepository)
    {
        var updatedServer = await witsmlServerRepository.UpdateDocumentAsync(witsmlServerId, witsmlServer);
        return Results.Ok(updatedServer);
    }

    public static async Task<IResult> DeleteWitsmlServer(Guid witsmlServerId, IDocumentRepository<Server, Guid> witsmlServerRepository)
    {
        await witsmlServerRepository.DeleteDocumentAsync(witsmlServerId);
        return Results.NoContent();
    }
}
