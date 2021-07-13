using System;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;
using System.Text;

namespace Witsml.ServiceReference
{
    public record OptionsIn
    {
        public ReturnElements ReturnElements { get; }

        public OptionsIn(ReturnElements returnElements)
        {
            ReturnElements = returnElements;
        }

        public override string ToString()
        {
            var optionsIn = new StringBuilder();
            optionsIn.Append($"returnElements={ReturnElements.GetEnumMemberValue()}");
            return optionsIn.ToString();
        }
    }

    public enum ReturnElements
    {
        [EnumMember(Value = "all")]
        All,
        [EnumMember(Value = "id-only")]
        IdOnly,
        [EnumMember(Value = "header-only")]
        HeaderOnly,
        [EnumMember(Value = "data-only")]
        DataOnly,
        [EnumMember(Value = "station-location-only")]
        StationLocationOnly,
        [EnumMember(Value = "latest-change-only")]
        LatestChangeOnly,
        [EnumMember(Value = "requested")]
        Requested
    }

    public static class EnumMemberToString
    {
        public static string GetEnumMemberValue<T>(this T value) where T : Enum
        {
            return typeof(T)
                .GetTypeInfo()
                .DeclaredMembers
                .SingleOrDefault(x => x.Name == value.ToString())
                ?.GetCustomAttribute<EnumMemberAttribute>(false)
                ?.Value;
        }
    }
}
