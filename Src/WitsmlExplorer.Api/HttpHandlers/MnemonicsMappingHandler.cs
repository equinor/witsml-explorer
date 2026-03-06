using System;
using System.Globalization;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public class MnemonicsMappingHandler
    {
        [Produces(typeof(MnemonicsMappingsQueryResult))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public static async Task<IResult> GetMnemonicMappings([FromBody] MnemonicsMappingsQuery query, [FromServices] IMnemonicsMappingService mnemonicsMappingService)
        {
            if (!ValidateQuery(query))
            {
                return TypedResults.BadRequest();
            }

            var result = await mnemonicsMappingService.QueryMnemonicsMapping(query);

            if (result != null)
            {
                return TypedResults.Ok(result);
            }

            return TypedResults.NotFound();
        }

        private static bool ValidateQuery(MnemonicsMappingsQuery query)
        {
            return query != null;
        }
    }
}
