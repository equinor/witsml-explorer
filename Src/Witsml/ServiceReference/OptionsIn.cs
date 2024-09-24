using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;

namespace Witsml.ServiceReference
{
    public record OptionsIn(
        ReturnElements? ReturnElements = null,
        int? MaxReturnNodes = null,
        int? RequestLatestValues = null,
        bool? RequestObjectSelectionCapability = null,
        bool? CascadedDelete = null,
        string OptionsInString = null)
    {
        public string OptionsInString { get; init; } = ValidateOptionsInString(OptionsInString);
        private static readonly string OptionsInRegexPattern = @"^([A-Za-z]+=[^=;]+)(;[A-Za-z]+=[^=;]+)*$";

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
            if (CascadedDelete == true)
            {
                keywords.Add($"cascadedDelete=true");
            }
            if (!string.IsNullOrEmpty(OptionsInString))
            {
                keywords.Add(OptionsInString);
            }

            return string.Join(";", keywords);
        }

        private static string ValidateOptionsInString(string optionsInString)
        {
            if (!string.IsNullOrEmpty(optionsInString) && !Regex.IsMatch(optionsInString, OptionsInRegexPattern))
            {
                throw new ArgumentException("OptionsInString does not match the required pattern.");
            }
            return optionsInString;
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
