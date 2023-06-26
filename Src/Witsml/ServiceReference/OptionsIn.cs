using System.Runtime.Serialization;
using System.Text;

namespace Witsml.ServiceReference
{
    public record OptionsIn(
        ReturnElements? ReturnElements = null,
        int? MaxReturnNodes = null,
        int? RequestLatestValues = null,
        bool? RequestObjectSelectionCapability = null)
    {
        public string GetKeywords()
        {
            StringBuilder keywords = new();
            if (ReturnElements != null)
            {
                keywords.Append($"returnElements={ReturnElements.Value.GetEnumMemberValue()}");
            }
            if (MaxReturnNodes is > 0)
            {
                keywords.Append($";maxReturnNodes={MaxReturnNodes.Value}");
            }
            if (RequestLatestValues is > 0)
            {
                keywords.Append($";requestLatestValues={RequestLatestValues.Value}");
            }
            if (RequestObjectSelectionCapability == true)
            {
                keywords.Append($";requestObjectSelectionCapability=true");
            }

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
