using System.IO;
using System.Text.RegularExpressions;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public partial class TestUtils
    {

        [GeneratedRegex("<dTimCreation>.+?<\\/dTimCreation>")]
        private static partial Regex DTimCreationRegex();
        [GeneratedRegex("<dTimLastChange>.+?<\\/dTimLastChange>")]
        private static partial Regex DTimLastChangeRegex();
        [GeneratedRegex("<objectGrowing>.+?<\\/objectGrowing>")]
        private static partial Regex ObjectGrowingRegex();
        [GeneratedRegex(">\\s+<")]
        private static partial Regex WhitespaceBetweenElementsRegex();


        public static string CleanResponse(string responseXml)
        {
            //disregard commonData times and objectGrowing as they are handled by the Witsml Server
            responseXml = DTimCreationRegex().Replace(responseXml, "");
            responseXml = DTimLastChangeRegex().Replace(responseXml, "");
            responseXml = ObjectGrowingRegex().Replace(responseXml, "");
            return responseXml;
        }

        public static string GetTestXml(string fileName)
        {
            string fileXml = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), $"../../../Resources/{fileName}.xml"));
            fileXml = WhitespaceBetweenElementsRegex().Replace(fileXml, "><").Replace("\t", " ").Replace("\n", "").Replace("\r", "");
            return fileXml;
        }
    }
}
