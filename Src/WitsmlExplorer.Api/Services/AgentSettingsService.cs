using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using Amazon.Runtime.Internal;

using Microsoft.AspNetCore.Http;

using Witsml.Extensions;

using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Services
{
    public interface IAgentSettingsService
    {
        Task<AgentSettings> GetAgentSettings();
        Task<AgentSettings> CreateAgentSettings(AgentSettings agentSettings, HttpContext httpContext);
        Task<AgentSettings> UpdateAgentSettings(AgentSettings agentSettings, HttpContext httpContext);
        Task DeleteAgentSettings();
    }

    public class AgentSettingsService : WitsmlService, IAgentSettingsService
    {
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        private readonly IDocumentRepository<AgentSettingsDocument, string> _agentSettingsRepository;
        private readonly ICredentialsService _credentialsService;

        public AgentSettingsService(
            IDocumentRepository<Server, Guid> witsmlServerRepository,
            IDocumentRepository<AgentSettingsDocument, string> agentSettingsRepository,
            ICredentialsService credentialsService,
            IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
            _witsmlServerRepository = witsmlServerRepository;
            _agentSettingsRepository = agentSettingsRepository;
            _credentialsService = credentialsService;
        }

        public async Task<AgentSettings> CreateAgentSettings(AgentSettings agentSettings, HttpContext httpContext)
        {
            var server = await GetCurrentServer();

            agentSettings.Username = await GetUsername(server.Id, httpContext);
            agentSettings.Timestamp = DateTime.UtcNow;

            var document = new AgentSettingsDocument(AgentSettingsDocument.GLOBAL_ID) { AgentSettings = agentSettings };
            var created = await _agentSettingsRepository.CreateDocumentAsync(document);
            return created?.AgentSettings;
        }

        public async Task DeleteAgentSettings()
        {
            var server = await GetCurrentServer();
            await _agentSettingsRepository.DeleteDocumentAsync(AgentSettingsDocument.GLOBAL_ID);
        }

        public async Task<AgentSettings> GetAgentSettings()
        {
            var server = await GetCurrentServer();
            var document = await _agentSettingsRepository.GetDocumentAsync(AgentSettingsDocument.GLOBAL_ID);

            return document?.AgentSettings;
        }

        public async Task<AgentSettings> UpdateAgentSettings(AgentSettings agentSettings, HttpContext httpContext)
        {
            var server = await GetCurrentServer();

            agentSettings.Username = await GetUsername(server.Id, httpContext);
            agentSettings.Timestamp = DateTime.UtcNow;

            var document = new AgentSettingsDocument(AgentSettingsDocument.GLOBAL_ID) { AgentSettings = agentSettings };
            var updated = await _agentSettingsRepository.UpdateDocumentAsync(AgentSettingsDocument.GLOBAL_ID, document);
            return updated?.AgentSettings;
        }

        private async Task<Server> GetCurrentServer()
        {
            var servers = await _witsmlServerRepository.GetDocumentsAsync();
            var serverUri = _witsmlClient.GetServerHostname();
            var server = servers?.FirstOrDefault(s => s.Url.EqualsIgnoreCase(serverUri));

            if (server == null)
            {
                throw new DataException($"AgentSettingsService - Server with URI [{serverUri}] not found in DB!");
            }

            return server;
        }

        private async Task<string> GetUsername(Guid serverId, HttpContext httpContext)
        {
            var httpHeaders = new EssentialHeaders(httpContext?.Request);
            var server = await GetCurrentServer();

            string username = "";

            if (server != null)
            {
                var usernames = await _credentialsService.GetLoggedInUsernames(httpHeaders, server.Url);

                if (usernames != null)
                {
                    username = string.Join(", ", usernames);
                }
            }

            return username;
        }
    }
}
