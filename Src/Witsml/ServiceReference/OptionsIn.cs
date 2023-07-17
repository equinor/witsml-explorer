using System.Collections.Generic;
using System.Runtime.Serialization;

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
            List<string> keywords = new();
            if (ReturnElements != null)
            {
                keywords.Add($"returnElements={ReturnElements.Value.GetEnumMemberValue()}");
            }
            if (MaxReturnNodes is > 0)
            {
                keywords.Add($"maxReturnNodes={MaxReturnNodes.Value}");
            }
            if (RequestLatestValues is > 0)
            {
                keywords.Add($"requestLatestValues={RequestLatestValues.Value}");
            }
            if (RequestObjectSelectionCapability == true)
            {
                keywords.Add($"requestObjectSelectionCapability=true");
            }

            return string.Join(";", keywords);
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
