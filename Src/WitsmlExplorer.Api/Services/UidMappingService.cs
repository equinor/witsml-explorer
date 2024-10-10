using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Services
{
    public interface IUidMappingService
    {
        Task<UidMapping> CreateUidMapping(UidMapping uidMapping, HttpContext httpContext);
        Task<UidMapping> UpdateUidMapping(UidMapping uidMapping, HttpContext httpContext);
        Task<ICollection<UidMapping>> QueryUidMapping(UidMappingDbQuery query);
        Task<bool> QueryDeleteUidMapping(UidMappingDbQuery query);
    }

    public class UidMappingService : IUidMappingService
    {
        private readonly IDocumentRepository<UidMappingCollection, UidMappingKey> _mappingRepository;
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        private readonly ICredentialsService _credentialsService;

        public UidMappingService(
            IDocumentRepository<UidMappingCollection, UidMappingKey> mappingRepository,
            IDocumentRepository<Server, Guid> witsmlServerRepository,
            ICredentialsService credentialsService)
        {
            _mappingRepository = mappingRepository;
            _witsmlServerRepository = witsmlServerRepository;
            _credentialsService = credentialsService;
        }

        public async Task<UidMapping> CreateUidMapping(UidMapping uidMapping, HttpContext httpContext)
        {
            var mappings = await _mappingRepository.GetDocumentAsync(new(uidMapping.SourceServerId, uidMapping.TargetServerId));

            if (mappings != null && !mappings.MappingCollection.IsNullOrEmpty()
                && mappings.MappingCollection.Exists(m => m.SourceWellId == uidMapping.SourceWellId && m.SourceWellboreId == uidMapping.SourceWellboreId))
            {
                return null;
            }

            uidMapping.Username = await GetUsername(uidMapping.SourceServerId, httpContext);
            uidMapping.Timestamp = DateTime.UtcNow;

            if (mappings != null)
            {
                mappings.MappingCollection.Add(uidMapping);

                await _mappingRepository.UpdateDocumentAsync(new(uidMapping.SourceServerId, uidMapping.TargetServerId), mappings);
            }
            else
            {
                mappings = new UidMappingCollection(new(uidMapping.SourceServerId, uidMapping.TargetServerId));

                mappings.MappingCollection.Add(uidMapping);

                await _mappingRepository.CreateDocumentAsync(mappings);
            }

            return uidMapping;
        }

        public async Task<UidMapping> UpdateUidMapping(UidMapping uidMapping, HttpContext httpContext)
        {
            var mappings = await _mappingRepository.GetDocumentAsync(new(uidMapping.SourceServerId, uidMapping.TargetServerId));

            if (mappings == null || mappings.MappingCollection.IsNullOrEmpty()
                || mappings.MappingCollection.RemoveAll(m => m.SourceWellId == uidMapping.SourceWellId && m.SourceWellboreId == uidMapping.SourceWellboreId) == 0)
            {
                return null;
            }

            uidMapping.Username = await GetUsername(uidMapping.SourceServerId, httpContext);
            uidMapping.Timestamp = DateTime.UtcNow;

            mappings.MappingCollection.Add(uidMapping);

            await _mappingRepository.UpdateDocumentAsync(new(uidMapping.SourceServerId, uidMapping.TargetServerId), mappings);

            return uidMapping;
        }

        public async Task<ICollection<UidMapping>> QueryUidMapping(UidMappingDbQuery query)
        {
            if ((query.SourceWellId.IsNullOrEmpty() && query.SourceWellboreId.IsNullOrEmpty())
                || (!query.SourceWellId.IsNullOrEmpty() && !query.SourceWellboreId.IsNullOrEmpty()))
            {
                var mappings = await _mappingRepository.GetDocumentAsync(new(query.SourceServerId, query.TargetServerId));

                if (mappings != null && !mappings.MappingCollection.IsNullOrEmpty())
                {
                    var mappingCollection = !query.SourceWellId.IsNullOrEmpty() && !query.SourceWellboreId.IsNullOrEmpty()
                        ? mappings.MappingCollection.Where(m => m.SourceWellId == query.SourceWellId && m.SourceWellboreId == query.SourceWellboreId)
                        : mappings.MappingCollection;

                    if (!mappingCollection.IsNullOrEmpty())
                    {
                        return mappingCollection.ToList();
                    }
                }
            }

            return new List<UidMapping>();
        }

        public async Task<bool> QueryDeleteUidMapping(UidMappingDbQuery query)
        {
            var mappings = await _mappingRepository.GetDocumentAsync(new(query.SourceServerId, query.TargetServerId));

            if (mappings != null)
            {
                if (mappings.MappingCollection.IsNullOrEmpty())
                {
                    await _mappingRepository.DeleteDocumentAsync(new(query.SourceServerId, query.TargetServerId));

                    return false;
                }
                else if (query.SourceWellId.IsNullOrEmpty() && query.SourceWellboreId.IsNullOrEmpty())
                {
                    await _mappingRepository.DeleteDocumentAsync(new(query.SourceServerId, query.TargetServerId));

                    return true;
                }
                else if (!query.SourceWellId.IsNullOrEmpty() && !query.SourceWellboreId.IsNullOrEmpty())
                {
                    var removed = mappings.MappingCollection.RemoveAll(m => m.SourceWellId == query.SourceWellId && m.SourceWellboreId == query.SourceWellboreId);

                    if (removed == 0)
                    {
                        return false;
                    }
                    else
                    {
                        if (mappings.MappingCollection.Count > 0)
                        {
                            await _mappingRepository.UpdateDocumentAsync(new(query.SourceServerId, query.TargetServerId), mappings);
                        }
                        else
                        {
                            await _mappingRepository.DeleteDocumentAsync(new(query.SourceServerId, query.TargetServerId));
                        }

                        return true;
                    }
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        private async Task<string> GetUsername(Guid serverId, HttpContext httpContext)
        {
            var httpHeaders = new EssentialHeaders(httpContext?.Request);
            var server = await _witsmlServerRepository.GetDocumentAsync(serverId);

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
