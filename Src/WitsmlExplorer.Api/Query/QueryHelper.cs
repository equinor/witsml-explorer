using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;

using WitsmlExplorer.Api.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public static class QueryHelper
    {
        /// <summary>
        /// Adds properties to an object based on a list of property names.
        /// </summary>
        /// <typeparam name="T">The type of the object.</typeparam>
        /// <param name="obj">The object to which properties will be added.</param>
        /// <param name="properties">A collection of property names to add, optionally supporting nested properties (e.g., "commonData.sourceName").</param>
        /// <returns>The modified object with added properties.</returns>
        public static T AddPropertiesToObject<T>(T obj, IEnumerable<string> properties)
        {
            foreach (string property in properties)
            {
                obj = AddPropertyToObject(obj, property);
            }
            return obj;
        }

        /// <summary>
        /// Adds a single property to an object based on its name.
        /// </summary>
        /// <typeparam name="T">The type of the object.</typeparam>
        /// <param name="obj">The object to which the property will be added.</param>
        /// <param name="property">The name of the property to add, optionally supporting nested properties (e.g., "commonData.sourceName").</param>
        /// <returns>The modified object with the added property.</returns>
        public static T AddPropertyToObject<T>(T obj, string property)
        {
            string childProperty = null;
            if (property.Contains('.'))
            {
                var propertyParts = property.Split(".", 2);
                property = propertyParts[0];
                childProperty = propertyParts[1];
            }

            PropertyInfo propertyInfo = obj.GetType().GetProperty(property.CapitalizeFirstLetter());

            if (propertyInfo == null || !propertyInfo.CanWrite)
            {
                throw new ArgumentException($"{property} must be a supported property of a {obj.GetType()}.");
            }

            object instance = GetOrCreateInstanceOfProperty(obj, propertyInfo);

            if (!string.IsNullOrEmpty(childProperty))
            {
                instance = AddPropertyToObject(instance, childProperty);
            }

            propertyInfo.SetValue(obj, instance);

            return obj;
        }

        private static object GetOrCreateInstanceOfProperty(object obj, PropertyInfo propertyInfo)
        {
            Type propertyType = propertyInfo.PropertyType;

            object instance = (propertyType == typeof(string)
                ? ""
                : propertyInfo.GetValue(obj, null))
                ?? (propertyType == typeof(string[])
                    ? new string[] { "" }
                    : Activator.CreateInstance(propertyType));

            if (propertyType.IsGenericType && propertyType.GetGenericTypeDefinition() == typeof(List<>))
            {
                Type listObjectType = propertyType.GetGenericArguments()[0];
                object listObjectInstance = listObjectType == typeof(string)
                    ? ""
                    : Activator.CreateInstance(listObjectType);
                ((IList)instance).Add(listObjectInstance);
            }

            return instance;
        }

        /// <summary>
        /// Retrieves a property from an object based on its name, supporting nested properties.
        /// </summary>
        /// <param name="obj">The object from which to retrieve the property.</param>
        /// <param name="property">The name of the property to retrieve, possibly nested (e.g., "commonData.sourceName").</param>
        /// <returns>The value of the specified property.</returns>
        public static object GetPropertyFromObject(object obj, string property)
        {
            var propertyParts = property.Split(".");
            foreach (var propertyPart in propertyParts)
            {
                obj = obj?.GetType().GetProperty(propertyPart.CapitalizeFirstLetter())?.GetValue(obj, null);
            }
            return obj;
        }
    }
}
