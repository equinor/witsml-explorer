using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class LasFileReaderTests
    {
        private const string Header = @"~VERSION INFORMATION
 VERS.                 2.0 : CWLS LOG ASCII STANDARD
 WRAP.                  {0} : One line per depth step
~WELL INFORMATION
 NULL.             -999.25 : NULL VALUE
~CURVE INFORMATION
#MNEM.UNIT  API CODE  : DESCRIPTION
 DEPT.M               : Depth
 GR  .GAPI            : Gamma ray
 RES .OHMM            : Resistivity
~A  DEPT   GR   RES
";

        private static LasFileReader CreateReader(string content)
        {
            return new LasFileReader(new MemoryStream(Encoding.UTF8.GetBytes(content)));
        }

        [Fact]
        public void ReadHeader_ParsesCurvesAndNullValue()
        {
            using LasFileReader reader = CreateReader(string.Format(Header, "NO"));

            reader.ReadHeader();

            Assert.Equal(new[] { "DEPT", "GR", "RES" }, reader.Curves.Select(c => c.Mnemonic));
            Assert.Equal(new[] { "M", "GAPI", "OHMM" }, reader.Curves.Select(c => c.Unit));
            Assert.Equal("-999.25", reader.NullValue);
            Assert.False(reader.Wrapped);
        }

        [Fact]
        public void ReadRows_ReplacesNullValuesAndSkipsComments()
        {
            string content = string.Format(Header, "NO") + "100.0 50 -999.25\n# comment\n\n100.5 -999.2500 2.5\n";
            using LasFileReader reader = CreateReader(content);
            reader.ReadHeader();

            List<string[]> rows = reader.ReadRows().ToList();

            Assert.Equal(2, rows.Count);
            Assert.Equal(new[] { "100.0", "50", "" }, rows[0]);
            Assert.Equal(new[] { "100.5", "", "2.5" }, rows[1]);
        }

        [Fact]
        public void ReadRows_WrappedMode_JoinsValuesAcrossLines()
        {
            string content = string.Format(Header, "YES") + "100.0\n 50 1.5\n100.5\n 51 1.6\n";
            using LasFileReader reader = CreateReader(content);
            reader.ReadHeader();

            List<string[]> rows = reader.ReadRows().ToList();

            Assert.True(reader.Wrapped);
            Assert.Equal(new[] { "100.0", "50", "1.5" }, rows[0]);
            Assert.Equal(new[] { "100.5", "51", "1.6" }, rows[1]);
        }

        [Fact]
        public void ReadRows_QuotedValues_AreReturnedWithoutQuotes()
        {
            string content = string.Format(Header, "NO") + "100.0 \"a b\" 1\n";
            using LasFileReader reader = CreateReader(content);
            reader.ReadHeader();

            string[] row = reader.ReadRows().Single();

            Assert.Equal(new[] { "100.0", "a b", "1" }, row);
        }

        [Fact]
        public void ReadRows_WrongNumberOfValues_Throws()
        {
            string content = string.Format(Header, "NO") + "100.0 50\n";
            using LasFileReader reader = CreateReader(content);
            reader.ReadHeader();

            Assert.Throws<InvalidDataException>(() => reader.ReadRows().ToList());
        }

        [Fact]
        public void ReadHeader_MissingAsciiSection_Throws()
        {
            using LasFileReader reader = CreateReader("~V\n VERS. 2.0 :\n~C\n DEPT.M :\n");

            Assert.Throws<InvalidDataException>(() => reader.ReadHeader());
        }
    }
}
