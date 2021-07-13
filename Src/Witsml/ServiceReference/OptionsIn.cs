using System.Runtime.Serialization;
using System.Text;

namespace Witsml.ServiceReference
{
    public record OptionsIn(
        ReturnElements ReturnElements,
        int? MaxReturnNodes = null)
    {
        public string GetKeywords()
        {
            var keywords = new StringBuilder();
            keywords.Append($"returnElements={ReturnElements.GetEnumMemberValue()}");
            if (MaxReturnNodes is > 0)
                keywords.Append($";maxReturnNodes={MaxReturnNodes.Value}");
            return keywords.ToString();
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
}
