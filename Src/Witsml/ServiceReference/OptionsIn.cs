namespace Witsml.ServiceReference
{
    public enum OptionsIn
    {
        All,
        IdOnly,
        HeaderOnly,
        DataOnly,
        StationLocationOnly,
        LatestChangeOnly,
        Requested
    }

    public static class OptionsInToString
    {
        public static string GetName(this OptionsIn input)
        {
            return input switch
            {
                OptionsIn.All => "returnElements=all",
                OptionsIn.IdOnly => "returnElements=id-only",
                OptionsIn.HeaderOnly => "returnElements=header-only",
                OptionsIn.DataOnly => "returnElements=data-only",
                OptionsIn.StationLocationOnly => "returnElements=station-location-only",
                OptionsIn.LatestChangeOnly => "returnElements=latest-change-only",
                OptionsIn.Requested => "returnElements=requested",
                _ => "returnElements=all"
            };
        }
    }
}
