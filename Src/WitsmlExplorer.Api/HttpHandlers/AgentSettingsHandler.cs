using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public class AgentSettingsHandler
    {

        [Produces(typeof(AgentSettings))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public static async Task<IResult> GetAgentSettings([FromServices] IAgentSettingsService agentSettingsService)
        {

            var result = await agentSettingsService.GetAgentSettings();

            if (result == null)
            {
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(result);

        }

        [Produces(typeof(AgentSettings))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public static async Task<IResult> CreateAgentSettings([FromBody] AgentSettings agentSettings, [FromServices] IAgentSettingsService agentSettingsService, HttpContext httpContext)
        {
            if (!Validate(agentSettings))
            {
                return TypedResults.BadRequest();
            }

            var result = await agentSettingsService.CreateAgentSettings(agentSettings, httpContext);

            if (result == null)
            {
                return TypedResults.Conflict();
            }

            return TypedResults.Ok(agentSettings);
        }

        [Produces(typeof(AgentSettings))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public static async Task<IResult> UpdateAgentSettings([FromBody] AgentSettings agentSettings, [FromServices] IAgentSettingsService agentSettingsService, HttpContext httpContext)
        {
            if (!Validate(agentSettings))
            {
                return TypedResults.BadRequest();
            }

            var result = await agentSettingsService.UpdateAgentSettings(agentSettings, httpContext);

            if (result == null)
            {
                return TypedResults.NotFound();
            }

            return TypedResults.Ok(agentSettings);
        }

        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public static async Task<IResult> DeleteAgentSettings([FromServices] IAgentSettingsService agentSettingsService)
        {
            await agentSettingsService.DeleteAgentSettings();
            return TypedResults.NoContent();
        }

        private static bool Validate(AgentSettings agentSettings)
        {
            return agentSettings != null;
        }
    }
}
