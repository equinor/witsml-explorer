using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IObjectService
    {
        Task<ICollection<ObjectSearchResult>> GetObjectsWithParamByType(EntityType objectType, string objectProperty, string objectPropertyValue);
        Task<ICollection<ObjectSearchResult>> GetObjectsByType(EntityType objectType);
        Task<ICollection<ObjectOnWellbore>> GetObjectsIdOnly(string wellUid, string wellboreUid, EntityType objectType);
        Task<ICollection<ObjectOnWellbore>> GetObjectIdOnly(string wellUid, string wellboreUid, string objectUid, EntityType objectType);
        Task<Dictionary<EntityType, int>> GetExpandableObjectsCount(string wellUid, string wellboreUid);
        Task<ICollection<SelectableObjectOnWellbore>> GetAllObjectsOnWellbore(string wellUid,
            string wellboreUid);
    }

    public class ObjectService : WitsmlService, IObjectService
    {
        private readonly List<EntityType> _expandableObjects = new() { EntityType.FluidsReport, EntityType.MudLog, EntityType.Trajectory, EntityType.Tubular, EntityType.WbGeometry };
        private readonly ILogger<ObjectService> _logger;

        public ObjectService(IWitsmlClientProvider witsmlClientProvider, ILogger<ObjectService> logger) : base(witsmlClientProvider)
        {
            _logger = logger;
        }

        public async Task<ICollection<ObjectSearchResult>> GetObjectsByType(EntityType objectType)
        {
            if (EntityTypeHelper.ToObjectOnWellbore(objectType) == null)
            {
                throw new ArgumentException($"{nameof(objectType)} must be a valid type of an object on wellbore");
            }

            var query = ObjectQueries.GetWitsmlObjectsByType(objectType);
            var result = await _witsmlClient.GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.Requested));
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
                    WellboreName = obj.NameWellbore,
                    WellName = obj.NameWell
                }
            ).ToList();
        }

        public async Task<ICollection<ObjectSearchResult>> GetObjectsWithParamByType(EntityType objectType, string objectProperty, string objectPropertyValue)
        {
            if (EntityTypeHelper.ToObjectOnWellbore(objectType) == null)
            {
                throw new ArgumentException($"{nameof(objectType)} must be a valid type of an object on wellbore");
            }
            else if (objectProperty == null)
            {
                throw new ArgumentException("objectProperty cannot be null!");
            }

            if (!objectPropertyValue.IsNullOrEmpty())
            {
                // send a request to see if the server is capable of searching by the property.
                IWitsmlObjectList capabilityQuery = (IWitsmlObjectList)EntityTypeHelper.ToObjectOnWellbore(objectType).AsItemInWitsmlList();
                IWitsmlObjectList capabilityResult = await _witsmlClient.GetFromStoreNullableAsync(capabilityQuery, new OptionsIn(RequestObjectSelectionCapability: true));

                WitsmlObjectOnWellbore capabilities = capabilityResult?.Objects?.FirstOrDefault();
                bool isCapable = capabilities?.GetType().GetProperty(objectProperty.CapitalizeFirstLetter())?.GetValue(capabilities, null) != null;
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
                    Name = obj.Name,
                    WellboreName = obj.NameWellbore,
                    WellName = obj.NameWell,
                    ObjectType = objectType
                };

                if (objectProperty != null)
                {
                    string propertyValue = (string)QueryHelper.GetPropertyFromObject(obj, objectProperty);
                    searchResult.SearchProperty = propertyValue;
                }

                return searchResult;
            }).ToList();
        }

        public async Task<ICollection<ObjectOnWellbore>> GetObjectsIdOnly(string wellUid, string wellboreUid, EntityType objectType)
        {
            return await GetObjectIdOnly(wellUid, wellboreUid, "", objectType);
        }

        public async Task<ICollection<ObjectOnWellbore>> GetObjectIdOnly(string wellUid, string wellboreUid, string objectUid, EntityType objectType)
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
                new BaseObjectOnWellbore()
                {
                    Uid = obj.Uid,
                    WellboreUid = obj.UidWellbore,
                    WellUid = obj.UidWell,
                    Name = obj.Name,
                    WellboreName = obj.NameWellbore,
                    WellName = obj.NameWell
                }
            ).ToArray();
        }

        public async Task<Dictionary<EntityType, int>> GetExpandableObjectsCount(string wellUid, string wellboreUid)
        {
            List<Task<(EntityType objectType, int count)>> countTasks = _expandableObjects.Select(
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
            ).ToList();
            await Task.WhenAll(countTasks);
            return countTasks.ToDictionary((task) => task.Result.objectType, (task) => task.Result.count);
        }

        public async Task<ICollection<SelectableObjectOnWellbore>> GetAllObjectsOnWellbore(string wellUid, string wellboreUid)
        {
            var result = new List<SelectableObjectOnWellbore>();
            foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
            {
                if (entityType is EntityType.Well or EntityType.Wellbore or EntityType.Log) continue;
                var objects = await GetWellboreObjectsByType(wellUid, wellboreUid, entityType);
                result.AddRange(ToSelectableObjectOnWellbore(objects, entityType, string.Empty));
            }
            var depthLogs = await GetWellboreObjectsByType(wellUid, wellboreUid, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD);
            result.AddRange(ToSelectableObjectOnWellbore(depthLogs, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD));
            var timeLogs = await GetWellboreObjectsByType(wellUid, wellboreUid, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            result.AddRange(ToSelectableObjectOnWellbore(timeLogs, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME));
            return result;
        }
        private async Task<IWitsmlObjectList> GetWellboreObjectsByType(string wellUid, string wellboreUid, EntityType entityType, string logIndexType = null)
        {
            IWitsmlObjectList query = ObjectQueries.GetWitsmlObjectById(
                wellUid,
                wellboreUid,
                "",
                entityType
            );

            if (entityType == EntityType.Log)
            {
                ((WitsmlLog)query.Objects.FirstOrDefault()).IndexType = logIndexType;
            }

            IWitsmlObjectList witsmlObjectList = await _witsmlClient.GetFromStoreNullableAsync(
                query,
                new OptionsIn(ReturnElements.IdOnly)
            );

            return witsmlObjectList;
        }

        private List<SelectableObjectOnWellbore> ToSelectableObjectOnWellbore(IWitsmlObjectList objects, EntityType entityType, string logType)
        {
            var result = new List<SelectableObjectOnWellbore>();
            foreach (var objectOnWellbore in objects.Objects)
            {
                var resultItem = new SelectableObjectOnWellbore
                {
                    ObjectType = entityType.ToString(),
                    LogType = logType,
                    Uid = objectOnWellbore.Uid,
                    Name = objectOnWellbore.Name
                };
                result.Add(resultItem);
            }
            return result;
        }
    }
}
