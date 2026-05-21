using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpObjectService
    {
        Task<IEnumerable<ObjectOnWellbore>> GetObjectsIdOnly(string wellUid, string wellboreUid, EntityType objectType, CancellationToken? cancellationToken);
        Task<ObjectOnWellbore> GetObjectIdOnly(string wellUid, string wellboreUid, string objectUid, EntityType objectType, CancellationToken? cancellationToken);
        Task<Dictionary<EntityType, int>> GetExpandableObjectsCount(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
    }

    public class EtpObjectService : EtpService, IEtpObjectService
    {
        private readonly List<EntityType> _expandableObjects = new() { EntityType.DataWorkOrder, EntityType.FluidsReport, EntityType.MudLog, EntityType.Trajectory, EntityType.Tubular, EntityType.WbGeometry };
        private readonly ILogger<EtpObjectService> _logger;

        public EtpObjectService(IEtpClientProvider etpClientProvider, ILogger<EtpObjectService> logger) : base(etpClientProvider)
        {
            _logger = logger;
        }

        public async Task<IEnumerable<ObjectOnWellbore>> GetObjectsIdOnly(string wellUid, string wellboreUid, EntityType objectType, CancellationToken? cancellationToken = null)
        {
            if (EntityTypeHelper.ToObjectOnWellbore(objectType) == null)
            {
                throw new ArgumentException($"{nameof(objectType)} must be a valid type of an object on wellbore");
            }

            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, objectType);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);

            // return ObjectOnWellbore to avoid serializing null fields from concrete WITSML types
            return resources.ToList().Select((resource) =>
                new BaseObjectOnWellbore()
                {
                    Uid = EtpUriHelper.GetObjectUid(resource.uri, objectType),
                    WellboreUid = EtpUriHelper.GetWellboreUid(resource.uri),
                    WellUid = EtpUriHelper.GetWellUid(resource.uri),
                    Name = resource.name,
                    WellboreName = null, // ETP does not provide wellbore name in the resource object.
                    WellName = null // ETP does not provide well name in the resource object.
                }
            ).ToArray();
        }

        public async Task<ObjectOnWellbore> GetObjectIdOnly(string wellUid, string wellboreUid, string objectUid, EntityType objectType, CancellationToken? cancellationToken = null)
        {
            if (EntityTypeHelper.ToObjectOnWellbore(objectType) == null)
            {
                throw new ArgumentException($"{nameof(objectType)} must be a valid type of an object on wellbore");
            }
            if (string.IsNullOrWhiteSpace(wellUid) || string.IsNullOrWhiteSpace(wellboreUid) || string.IsNullOrWhiteSpace(objectUid))
            {
                throw new ArgumentException($"{nameof(wellUid)}, {nameof(wellboreUid)}, and {nameof(objectUid)} must be provided");
            }

            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, objectType, objectUid);
            var objList = await client.GetObjectAsWitsmlAsync(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }
            var obj = objList.Objects.First();
            return new BaseObjectOnWellbore()
            {
                Uid = obj.Uid,
                WellboreUid = obj.UidWellbore,
                WellUid = obj.UidWell,
                Name = obj.Name,
                WellboreName = obj.NameWellbore,
                WellName = obj.NameWell
            };
        }

        public async Task<Dictionary<EntityType, int>> GetExpandableObjectsCount(string wellUid, string wellboreUid, CancellationToken? cancellationToken = null)
        {
            var client = await GetEtpClient(cancellationToken);
            List<Task<(EntityType objectType, int count)>> countTasks = _expandableObjects.Select(
                async (objectType) =>
                {
                    var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, objectType);
                    try
                    {
                        var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
                        return (objectType, resources?.Count ?? 0);
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
    }
}
