using System;

namespace WitsmlExplorer.Api.Services.ETP
{
    public static class EtpUriHelper
    {
        private const string UriPrefix = "eml://witsml14";

        public static string CreateWellUri(string wellUid = null)
        {
            return string.IsNullOrWhiteSpace(wellUid)
                ? $"{UriPrefix}/well"
                : $"{UriPrefix}/well({wellUid})";
        }

        public static string CreateWellboreUri(string wellUid, string wellboreUid = null)
        {
            if (string.IsNullOrWhiteSpace(wellUid))
                throw new ArgumentException("wellUid must be provided.");

            return string.IsNullOrWhiteSpace(wellboreUid)
                ? $"{UriPrefix}/wellbore"
                : $"{UriPrefix}/wellbore({wellboreUid})";
        }

        public static string CreateObjectUri(string wellUid, string wellboreUid, string objectType, string objectUid = null)
        {
            if (string.IsNullOrWhiteSpace(wellUid))
                throw new ArgumentException("wellUid must be provided.");
            if (string.IsNullOrWhiteSpace(wellboreUid))
                throw new ArgumentException("wellboreUid must be provided.");
            if (string.IsNullOrWhiteSpace(objectType))
                throw new ArgumentException("objectType must be provided.");

            return string.IsNullOrWhiteSpace(objectUid)
                ? $"{UriPrefix}/well({wellUid})/wellbore({wellboreUid})/{objectType}"
                : $"{UriPrefix}/well({wellUid})/wellbore({wellboreUid})/{objectType}({objectUid})";
        }

        public static string GetWellUid(string uri)
        {
            return GetUidForObjectType(uri, "well");
        }

        public static string GetWellboreUid(string uri)
        {
            return GetUidForObjectType(uri, "wellbore");
        }

        public static string GetObjectUid(string uri, string objectType)
        {
            return GetUidForObjectType(uri, objectType);
        }

        private static string GetUidForObjectType(string uri, string objectType)
        {
            if (string.IsNullOrWhiteSpace(uri) || string.IsNullOrWhiteSpace(objectType))
            {
                return null;
            }

            string marker = objectType + "(";
            int markerStart = uri.LastIndexOf(marker, StringComparison.OrdinalIgnoreCase);
            if (markerStart < 0)
            {
                return null;
            }

            int openIdx = markerStart + objectType.Length;
            int closeIdx = uri.IndexOf(')', openIdx + 1);
            if (closeIdx <= openIdx)
            {
                return null;
            }

            return uri.Substring(openIdx + 1, closeIdx - openIdx - 1);
        }
    }
}
