using System.Collections.Generic;
using System.Linq;

using Witsml.Data;

namespace WitsmlExplorer.Api.Query
{
    public static class ObjectQueries
    {
        public static IEnumerable<T> DeleteObjectsQuery<T>(string wellUid, string wellboreUid, string[] objectUids) where T : ObjectOnWellbore, new()
        {
            return objectUids.Select((uid) =>
                new T
                {
                    Uid = uid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }
            );
        }
        public static IEnumerable<T> CopyObjectsQuery<T>(IEnumerable<T> objects, WitsmlWellbore targetWellbore) where T : ObjectOnWellbore
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
    }
}
