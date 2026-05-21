using System;

using WitsmlExplorer.Api.Models;

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
                ? $"{UriPrefix}/well({wellUid})/wellbore"
                : $"{UriPrefix}/well({wellUid})/wellbore({wellboreUid})";
        }

        public static string CreateObjectUri(string wellUid, string wellboreUid, EntityType objectType, string objectUid = null)
        {
            if (string.IsNullOrWhiteSpace(wellUid))
                throw new ArgumentException("wellUid must be provided.");
            if (string.IsNullOrWhiteSpace(wellboreUid))
                throw new ArgumentException("wellboreUid must be provided.");

            return string.IsNullOrWhiteSpace(objectUid)
                ? $"{UriPrefix}/well({wellUid})/wellbore({wellboreUid})/{objectType.ToString().ToLower()}"
                : $"{UriPrefix}/well({wellUid})/wellbore({wellboreUid})/{objectType.ToString().ToLower()}({objectUid})";
        }

        public static string GetWellUid(string uri)
        {
            return GetUidForObjectType(uri, EntityType.Well);
        }

        public static string GetWellboreUid(string uri)
        {
            return GetUidForObjectType(uri, EntityType.Wellbore);
        }

        public static string GetObjectUid(string uri, EntityType objectType)
        {
            return GetUidForObjectType(uri, objectType);
        }

        private static string GetUidForObjectType(string uri, EntityType objectType)
        {
            if (string.IsNullOrWhiteSpace(uri))
            {
                return null;
            }

            string marker = objectType.ToString() + "(";
            int markerStart = uri.LastIndexOf(marker, StringComparison.OrdinalIgnoreCase);
            if (markerStart < 0)
            {
                return null;
            }

            int openIdx = markerStart + objectType.ToString().Length;
            int closeIdx = uri.IndexOf(')', openIdx + 1);
            if (closeIdx <= openIdx)
            {
                return null;
            }

            return uri.Substring(openIdx + 1, closeIdx - openIdx - 1);
        }
    }
}
