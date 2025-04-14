using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;

using LiteDB;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class UidMappingHandler
    {
        [Produces(typeof(UidMapping))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public static async Task<IResult> CreateUidMapping([FromBody] UidMapping uidMapping, [FromServices] IUidMappingService uidMappingService, HttpContext httpContext)
        {
            if (!Validate(uidMapping))
            {
                return TypedResults.BadRequest();
            }

            var result = await uidMappingService.CreateUidMapping(uidMapping, httpContext);

            if (result != null)
            {
                return TypedResults.Ok(uidMapping);
            }
            else
            {
                return TypedResults.Conflict();
            }
        }

        [Produces(typeof(UidMapping))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public static async Task<IResult> UpdateUidMapping([FromBody] UidMapping uidMapping, [FromServices] IUidMappingService uidMappingService, HttpContext httpContext)
        {
            if (!Validate(uidMapping))
            {
                return TypedResults.BadRequest();
            }

            var result = await uidMappingService.UpdateUidMapping(uidMapping, httpContext);

            if (result != null)
            {
                return TypedResults.Ok(uidMapping);
            }
            else
            {
                return TypedResults.NotFound();
            }
        }

        [Produces(typeof(ICollection<UidMapping>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public static async Task<IResult> QueryUidMapping([FromBody] UidMappingDbQuery query, [FromServices] IUidMappingService uidMappingService)
        {
            if (!ValidateQuery(query))
            {
                return TypedResults.BadRequest();
            }

            return TypedResults.Ok(await uidMappingService.QueryUidMapping(query));
        }

        [Produces(typeof(ICollection<UidMappingBasicInfo>))]
        public static async Task<IResult> GetUidMappingBasicInfos([FromServices] IUidMappingService uidMappingService)
        {
            return TypedResults.Ok(await uidMappingService.GetUidMappingBasicInfos());
        }

        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public static async Task<IResult> DeleteUidMapping([FromBody] UidMappingDbQuery query, [FromServices] IUidMappingService uidMappingService)
        {
            if (!ValidateQuery(query))
            {
                return TypedResults.BadRequest();
            }

            if (await uidMappingService.DeleteUidMapping(query))
            {
                return TypedResults.NoContent();
            }
            else
            {
                return TypedResults.NotFound();
            }
        }

        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public static async Task<IResult> DeleteUidMappings(string wellUid, string wellboreUid, [FromServices] IUidMappingService uidMappingService)
        {
            if (await uidMappingService.DeleteUidMappings(wellUid, wellboreUid))
            {
                return TypedResults.NoContent();
            }
            else
            {
                return TypedResults.NotFound();
            }
        }

        private static bool Validate(UidMapping uidMapping)
        {
            return uidMapping != null && uidMapping.SourceServerId != Guid.Empty && uidMapping.TargetServerId != Guid.Empty
                && !uidMapping.SourceWellId.IsNullOrEmpty() && !uidMapping.TargetWellId.IsNullOrEmpty()
                && !uidMapping.SourceWellboreId.IsNullOrEmpty() && !uidMapping.TargetWellboreId.IsNullOrEmpty();
        }

        private static bool ValidateQuery(UidMappingDbQuery query)
        {
            return query != null && query.SourceServerId != Guid.Empty && query.TargetServerId != Guid.Empty;
        }
    }
}
