namespace Witsml;

/// <summary>
/// Class that define common constants used in the whole application
/// </summary>
public static class CommonConstants
{
    public const int DefaultNumberOfRoundedPlaces = 3;
    public const string DataSeparator = ",";
    public const string PropertySeparator = ".";
    public const string NewLine = "\n";
    public const int DefaultClientRequestTimeOutSeconds = 90;
    public const int DefaultReloadIntervalMinutes = 15;
    public const string Yes = "Yes";
    public const string No = "No";

    public static class DepthIndex
    {
        public const string DefaultUnit = Unit.Meter;
        public const double NullValue = -999.25;
        public const double OffsetEpsilon = 1e-3;
        public const double Epsilon = 1e-5;
    }

    public static class DateTimeIndex
    {
        public const string IsoPattern = "yyyy-MM-ddTHH:mm:ss.fffZ";
        public const string NullValue = "1900-01-01T00:00:00.000Z";
    }

    public static class TimeSpanIndex
    {
        public const string Pattern = @"hh\:mm\:ss";
    }

    public static class Unit
    {
        public const string Unitless = "unitless";
        public const string Meter = "m";
        public const string Feet = "ft";
        public const string Second = "s";
    }

    public static class WitsmlQueryTypeName
    {
        public const string Log = "log";
    }

    public static class WitsmlFunctionType
    {
        public const string WMLSUpdateInStore = "WMLS_UpdateInStore";
    };
}
