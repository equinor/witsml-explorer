using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace Witsml.Helpers;

/// <summary>
/// Helper class for working with Enum.
/// </summary>
public static class EnumHelper
{
    /// <summary>
    /// Gets a list of descriptions for all values in the specified Enum.
    /// </summary>
    /// <typeparam name="TEnum">The Enum type.</typeparam>
    /// <returns>A list of string descriptions for all Enum values.</returns>
    public static List<string> GetEnumDescriptions<TEnum>() where TEnum : Enum
    {
        return Enum.GetValues(typeof(TEnum))
            .Cast<TEnum>()
            .Select(value => GetEnumDescription(value))
            .ToList();
    }

    /// <summary>
    /// Gets the description of a specific Enum value. If the description is not found, then return the enum value.
    /// </summary>
    /// <param name="value">The Enum value.</param>
    /// <typeparam name="TEnum">The Enum type.</typeparam>
    /// <returns>The description of the Enum value.</returns>
    public static string GetEnumDescription<TEnum>(TEnum value)
        where TEnum : Enum
    {
        var field = typeof(TEnum).GetField(value.ToString());
        return field != null &&
               Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute))
                   is DescriptionAttribute descriptionAttribute
            ? descriptionAttribute.Description
            : value.ToString();
    }
}
