using System;

namespace WitsmlExplorer.Api.Models;

public static class EnumConverter
{
    public static TEnum ConvertEnum<TEnum>(this Enum source)
    {
        return (TEnum)Enum.Parse(typeof(TEnum), source.ToString(), true);
    }
}
