using System.Collections.Generic;
using System.Linq;

using Witsml.Data;
using Witsml.Data.MudLog;
using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public static class ObjectQueries
    {
        public static IEnumerable<WitsmlObjectOnWellbore> DeleteObjectsQuery(ObjectReferences toDelete)
        {
            return IdsToObjects(toDelete.WellUid, toDelete.WellboreUid, toDelete.ObjectUids, toDelete.ObjectType);
        }

        public static IEnumerable<WitsmlObjectOnWellbore> IdsToObjects(string wellUid, string wellboreUid, string[] objectUids, EntityType type)
        {
            return objectUids.Select((uid) =>
            {
                WitsmlObjectOnWellbore o = EntityTypeHelper.EntityTypeToObjectOnWellbore(type);
                o.Uid = uid;
                o.UidWellbore = wellboreUid;
                o.UidWell = wellUid;
                return o;
            }
            );
        }

        public static IEnumerable<T> CopyObjectsQuery<T>(IEnumerable<T> objects, WitsmlWellbore targetWellbore) where T : WitsmlObjectOnWellbore
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

        public static IWitsmlObjectList GetWitsmlObjectById(string wellUid, string wellboreUid, string objectUid, EntityType type)
        {
            return GetWitsmlObjectsByIds(wellUid, wellboreUid, new string[] { objectUid }, type);
        }

        public static void SetComponents(WitsmlObjectOnWellbore objectOnWellbore, ComponentType componentType, IEnumerable<string> componentUids)
        {
            switch (componentType)
            {
                case ComponentType.GeologyInterval:
                    ((WitsmlMudLog)objectOnWellbore).GeologyInterval = componentUids.Select(uid =>
                        new WitsmlMudLogGeologyInterval { Uid = uid }).ToList();
                    break;
                case ComponentType.Mnemonic:
                    ((WitsmlLog)objectOnWellbore).LogCurveInfo = componentUids.Select(mnemonic =>
                        new WitsmlLogCurveInfo { Mnemonic = mnemonic }).ToList();
                    break;
                case ComponentType.TrajectoryStation:
                    ((WitsmlTrajectory)objectOnWellbore).TrajectoryStations = componentUids.Select(uid =>
                        new WitsmlTrajectoryStation { Uid = uid }).ToList();
                    break;
                case ComponentType.TubularComponent:
                    ((WitsmlTubular)objectOnWellbore).TubularComponents = componentUids.Select(uid =>
                        new WitsmlTubularComponent { Uid = uid }).ToList();
                    break;
                case ComponentType.WbGeometrySection:
                    ((WitsmlWbGeometry)objectOnWellbore).WbGeometrySections = componentUids.Select(uid =>
                        new WitsmlWbGeometrySection { Uid = uid }).ToList();
                    break;
                default:
                    break;
            }
        }
    }
}
