using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class WitsmlServerHandler
    {
        [Produces(typeof(IEnumerable<Server>))]
        public static async Task<IResult> GetWitsmlServers([FromServices] IDocumentRepository<Server, Guid> witsmlServerRepository)
        {
            IEnumerable<Server> servers = await witsmlServerRepository.GetDocumentsAsync();
            return TypedResults.Ok(servers);
        }
        [Produces(typeof(Server))]
        public static async Task<IResult> CreateWitsmlServer(Server witsmlServer, [FromServices] IDocumentRepository<Server, Guid> witsmlServerRepository)
        {
            Server inserted = await witsmlServerRepository.CreateDocumentAsync(witsmlServer);
            return Results.Ok(inserted);
        }

        [Produces(typeof(Server))]
        public static async Task<IResult> UpdateWitsmlServer(Guid witsmlServerId, Server witsmlServer, [FromServices] IDocumentRepository<Server, Guid> witsmlServerRepository)
        {
            Server updatedServer = await witsmlServerRepository.UpdateDocumentAsync(witsmlServerId, witsmlServer);
            return Results.Ok(updatedServer);
        }

        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public static async Task<IResult> DeleteWitsmlServer(Guid witsmlServerId, [FromServices] IDocumentRepository<Server, Guid> witsmlServerRepository)
        {
            await witsmlServerRepository.DeleteDocumentAsync(witsmlServerId);
            return Results.NoContent();
        }
    }
}
