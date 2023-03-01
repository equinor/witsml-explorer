using System.Collections.Generic;
using System.Linq;

using Witsml.Data;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public static class ObjectQueries
    {
        public static IEnumerable<Witsml.Data.ObjectOnWellbore> DeleteObjectsQuery(ObjectReferences toDelete)
        {
            return IdsToObjects(toDelete.WellUid, toDelete.WellboreUid, toDelete.ObjectUids, toDelete.ObjectType);
        }

        public static IEnumerable<Witsml.Data.ObjectOnWellbore> IdsToObjects(string wellUid, string wellboreUid, string[] objectUids, EntityType type)
        {
            return objectUids.Select((uid) =>
            {
                Witsml.Data.ObjectOnWellbore o = EntityTypeHelper.EntityTypeToObjectOnWellbore(type);
                o.Uid = uid;
                o.UidWellbore = wellboreUid;
                o.UidWell = wellUid;
                return o;
            }
            );
        }

        public static IEnumerable<T> CopyObjectsQuery<T>(IEnumerable<T> objects, WitsmlWellbore targetWellbore) where T : Witsml.Data.ObjectOnWellbore
        {
            return objects.Select((o) =>
            {
                o.UidWell = targetWellbore.UidWell;
                o.NameWell = targetWellbore.NameWell;
                o.UidWellbore = targetWellbore.Uid;
                o.NameWellbore = targetWellbore.Name;
                return o;
            });
        }

        public static IWitsmlObjectList GetWitsmlObjectsByIds(string wellUid, string wellboreUid, string[] objectUids, EntityType type)
        {
            IWitsmlObjectList list = EntityTypeHelper.EntityTypeToObjectList(type);
            list.Objects = IdsToObjects(wellUid, wellboreUid, objectUids, type);
            return list;
        }
    }
}
