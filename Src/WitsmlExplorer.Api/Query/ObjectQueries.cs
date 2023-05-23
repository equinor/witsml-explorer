using System;
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
                WitsmlObjectOnWellbore o = EntityTypeHelper.ToObjectOnWellbore(type);
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
            IWitsmlObjectList list = EntityTypeHelper.ToObjectList(type);
            list.Objects = IdsToObjects(wellUid, wellboreUid, objectUids, type);
            return list;
        }

        public static IWitsmlObjectList GetWitsmlObjectById(string wellUid, string wellboreUid, string objectUid, EntityType type)
        {
            return GetWitsmlObjectsByIds(wellUid, wellboreUid, new string[] { objectUid }, type);
        }

        public static IWitsmlObjectList GetWitsmlObjectByReference(ObjectReference reference, EntityType type)
        {
            return GetWitsmlObjectsByIds(reference.WellUid, reference.WellboreUid, new string[] { reference.Uid }, type);
        }

        /// <summary>
        /// Sets the components list on <paramref name="objectOnWellbore"/> of the <paramref name="componentType"/> type to a new list of components
        /// with their UIDs specified by <paramref name="componentUids"/>. The switch/case could have switched on the derived type of <paramref name="objectOnWellbore"/>, such as WitsmlMudLog,
        /// but we use <paramref name="componentType"/> instead because a WITSML object can have multiple types of components, such as Parameter and GeologyInterval for MudLog.
        /// </summary>
        /// <param name="objectOnWellbore">The WITSML object to set the components list on.</param>
        /// <param name="componentType">The type of components to set.</param>
        /// <param name="componentUids">A list of uids that will be used to initialize the components.</param>
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
                    throw new ArgumentException($"Invalid component type {componentType}");
            }
        }

        public static IEnumerable<string> GetComponentUids(WitsmlObjectOnWellbore objectOnWellbore, ComponentType componentType)
        {
            return componentType switch
            {
                ComponentType.GeologyInterval => ((WitsmlMudLog)objectOnWellbore).GeologyInterval.Select(component => component.Uid),
                ComponentType.Mnemonic => ((WitsmlLog)objectOnWellbore).LogCurveInfo.Select(component => component.Uid),
                ComponentType.TrajectoryStation => ((WitsmlTrajectory)objectOnWellbore).TrajectoryStations.Select(component => component.Uid),
                ComponentType.TubularComponent => ((WitsmlTubular)objectOnWellbore).TubularComponents.Select(component => component.Uid),
                ComponentType.WbGeometrySection => ((WitsmlWbGeometry)objectOnWellbore).WbGeometrySections.Select(component => component.Uid),
                _ => throw new ArgumentException($"Invalid component type {componentType}"),
            };
        }

        /// <summary>
        /// Initializes a new WitsmlObjectOnWellbore of the parent type of <paramref name="componentType"/> with UIDs initialized from <paramref name="reference"/>.
        /// All components of type <paramref name="componentType"/> from <paramref name="source"/> will be set on the return object.
        /// </summary>
        /// <param name="source">The WITSML object to set the components list on.</param>
        /// <param name="componentType">The type of components to set.</param>
        /// <param name="reference">A list of uids that will be used to initialize the components.</param>
        public static WitsmlObjectOnWellbore CopyComponents(WitsmlObjectOnWellbore source, ComponentType componentType, ObjectReference reference)
        {
            WitsmlObjectOnWellbore target = EntityTypeHelper.FromObjectReference(componentType.ToParentType(), reference);
            switch (componentType)
            {
                case ComponentType.GeologyInterval:
                    ((WitsmlMudLog)target).GeologyInterval = ((WitsmlMudLog)source).GeologyInterval;
                    return target;
                case ComponentType.Mnemonic:
                    ((WitsmlLog)target).LogCurveInfo = ((WitsmlLog)source).LogCurveInfo;
                    return target;
                case ComponentType.TrajectoryStation:
                    ((WitsmlTrajectory)target).TrajectoryStations = ((WitsmlTrajectory)source).TrajectoryStations;
                    return target;
                case ComponentType.TubularComponent:
                    ((WitsmlTubular)target).TubularComponents = ((WitsmlTubular)source).TubularComponents;
                    return target;
                case ComponentType.WbGeometrySection:
                    ((WitsmlWbGeometry)target).WbGeometrySections = ((WitsmlWbGeometry)source).WbGeometrySections;
                    return target;
                default:
                    throw new ArgumentException($"Invalid component type {componentType}");
            }
        }
    }
}
