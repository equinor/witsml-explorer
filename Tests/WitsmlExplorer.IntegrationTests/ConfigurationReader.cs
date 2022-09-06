using Microsoft.Extensions.Configuration;

namespace WitsmlExplorer.IntegrationTests
{
    public static class ConfigurationReader
    {
        public static IConfiguration GetConfig()
        {
            return new ConfigurationBuilder()
                .AddJsonFile("secrets.json")
                .Build();
        }

        public static WitsmlConfiguration GetWitsmlConfiguration()
        {
            IConfiguration config = GetConfig();
            return new WitsmlConfiguration
            {
                Hostname = config["Witsml:Host"],
                Username = config["Witsml:Username"],
                Password = config["Witsml:Password"]
            };
        }
    }

    public class WitsmlConfiguration
    {
        public string Hostname { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
