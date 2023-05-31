using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IObjectService
    {
        Task<IEnumerable<ObjectOnWellbore>> GetObjectsIdOnly(string wellUid, string wellboreUid, EntityType objectType);
        Task<IEnumerable<ObjectOnWellbore>> GetObjectIdOnly(string wellUid, string wellboreUid, string objectUid, EntityType objectType);
    }

    public class ObjectService : WitsmlService, IObjectService
    {
        public ObjectService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

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

    }
}
