using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IObjectService
    {
        Task<IEnumerable<ObjectSearchResult>> GetObjectsWithParamByType(EntityType objectType, string objectProperty, string objectPropertyValue);
        Task<IEnumerable<ObjectSearchResult>> GetObjectsByType(EntityType objectType);
        Task<IEnumerable<ObjectOnWellbore>> GetObjectsIdOnly(string wellUid, string wellboreUid, EntityType objectType);
        Task<IEnumerable<ObjectOnWellbore>> GetObjectIdOnly(string wellUid, string wellboreUid, string objectUid, EntityType objectType);
        Task<Dictionary<EntityType, int>> GetExpandableObjectsCount(string wellUid, string wellboreUid);
    }

    public class ObjectService : WitsmlService, IObjectService
    {
        private readonly List<EntityType> _expandableObjects = new() { EntityType.FluidsReport, EntityType.MudLog, EntityType.Trajectory, EntityType.Tubular, EntityType.WbGeometry };
        private readonly ILogger<ObjectService> _logger;

        public ObjectService(IWitsmlClientProvider witsmlClientProvider, ILogger<ObjectService> logger) : base(witsmlClientProvider)
        {
            _logger = logger;
        }

        public async Task<IEnumerable<ObjectSearchResult>> GetObjectsByType(EntityType objectType)
        {
            if (EntityTypeHelper.ToObjectOnWellbore(objectType) == null)
            {
                throw new ArgumentException($"{nameof(objectType)} must be a valid type of an object on wellbore");
            }

            IWitsmlObjectList query = ObjectQueries.GetWitsmlObjectsByType(objectType);
            IWitsmlObjectList result = await _witsmlClient.GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.Requested));
            if (result?.Objects == null)
            {
                return new List<ObjectSearchResult>();
            }

            return result.Objects.Select((obj) =>
                new ObjectSearchResult()
                {
                    Uid = obj.Uid,
                    WellboreUid = obj.UidWellbore,
                    WellUid = obj.UidWell,
                    Name = obj.Name,
                }
            );
        }

        public async Task<IEnumerable<ObjectSearchResult>> GetObjectsWithParamByType(EntityType objectType, string objectProperty, string objectPropertyValue)
        {
            if (EntityTypeHelper.ToObjectOnWellbore(objectType) == null)
            {
                throw new ArgumentException($"{nameof(objectType)} must be a valid type of an object on wellbore");
            }

            if (objectProperty != null)
            {
                // send a request to see if the server is capable of searching by the property.
                IWitsmlObjectList capabilityQuery = (IWitsmlObjectList)EntityTypeHelper.ToObjectOnWellbore(objectType).AsSingletonWitsmlList();
                IWitsmlObjectList capabilityResult = await _witsmlClient.GetFromStoreNullableAsync(capabilityQuery, new OptionsIn(RequestObjectSelectionCapability: true));

                WitsmlObjectOnWellbore capabilities = capabilityResult.Objects.First();
                bool isCapable = capabilities.GetType().GetProperty(objectProperty.CapitalizeFirstLetter())?.GetValue(capabilities, null) != null;
                if (!isCapable)
                {
                    throw new Middleware.WitsmlUnsupportedCapabilityException($"The server does not support to select {objectProperty} for a {objectType}.");
                }
            }

            // Send the actual query
            IWitsmlObjectList query = ObjectQueries.GetWitsmlObjectsWithParamByType(objectType, objectProperty, objectPropertyValue);
            IWitsmlObjectList result = await _witsmlClient.GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.Requested));
            if (result?.Objects == null)
            {
                return new List<ObjectSearchResult>();
            }

            return result.Objects.Select((obj) =>
            {
                ObjectSearchResult searchResult = new()
                {
                    Uid = obj.Uid,
                    WellboreUid = obj.UidWellbore,
                    WellUid = obj.UidWell,
                    Name = obj.Name
                };

                if (objectProperty != null)
                {
                    PropertyInfo witsmlProperty = obj.GetType().GetProperty(objectProperty.CapitalizeFirstLetter());
                    if (witsmlProperty != null)
                    {
                        string propertyValue = witsmlProperty.GetValue(obj)?.ToString();
                        searchResult.SearchProperty = propertyValue;
                    }
                }

                return searchResult;
            });
        }

        public async Task<IEnumerable<ObjectOnWellbore>> GetObjectsIdOnly(string wellUid, string wellboreUid, EntityType objectType)
        {
            return await GetObjectIdOnly(wellUid, wellboreUid, "", objectType);
        }

        public async Task<IEnumerable<ObjectOnWellbore>> GetObjectIdOnly(string wellUid, string wellboreUid, string objectUid, EntityType objectType)
        {
            if (EntityTypeHelper.ToObjectOnWellbore(objectType) == null)
            {
                throw new ArgumentException($"{nameof(objectType)} must be a valid type of an object on wellbore");
            }
            IWitsmlObjectList query = ObjectQueries.GetWitsmlObjectById(wellUid, wellboreUid, objectUid, objectType);
            IWitsmlObjectList result = await _witsmlClient.GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.IdOnly));
            if (result?.Objects == null)
            {
                return new List<ObjectOnWellbore>();
            }
            // return ObjectOnWellbore to avoid serializing null fields from concrete WITSML types
            return result.Objects.Select((obj) =>
                new ObjectOnWellbore()
                {
                    Uid = obj.Uid,
                    WellboreUid = obj.UidWellbore,
                    WellUid = obj.UidWell,
                    Name = obj.Name,
                    WellboreName = obj.NameWellbore,
                    WellName = obj.NameWell
                }
            );
        }

        public async Task<Dictionary<EntityType, int>> GetExpandableObjectsCount(string wellUid, string wellboreUid)
        {
            IEnumerable<Task<(EntityType objectType, int count)>> countTasks = _expandableObjects.Select(
                async (objectType) =>
                {
                    IWitsmlObjectList query = ObjectQueries.GetWitsmlObjectById(wellUid, wellboreUid, "", objectType);
                    try
                    {
                        // using ReturnElements.Requested should skip fetching well, wellbore, and object names, as opposed to IdOnly
                        IWitsmlObjectList result = await _witsmlClient.GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.Requested));
                        return (objectType, result?.Objects?.Count() ?? 0);
                    }
                    catch (Exception e)
                    {
                        _logger.LogWarning("GetExpandableObjectsCount query failed: {exception}", e);
                        return (objectType, 0);
                    }
                }
            );
            await Task.WhenAll(countTasks);
            return countTasks.ToDictionary((task) => task.Result.objectType, (task) => task.Result.count);
        }
    }
}
