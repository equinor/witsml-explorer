using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services.ETP;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class EtpUriHelperTests
    {
        [Fact]
        public void GetWellUid_WellTokenPresent_ReturnsUid()
        {
            string uri = "eml://witsml14/well(well-123)";

            string uid = EtpUriHelper.GetWellUid(uri);

            Assert.Equal("well-123", uid);
        }

        [Fact]
        public void GetWellUid_AllTokensPresent_ReturnsUid()
        {
            string uri = "eml://witsml14/well(well-123)/wellbore(wb-123)/log(log-123)";

            string uid = EtpUriHelper.GetWellUid(uri);

            Assert.Equal("well-123", uid);
        }

        [Fact]
        public void GetWellUid_WellTokenMissing_ReturnsNull()
        {
            string uri = "eml://witsml14/wellbore(wb-123)";

            string uid = EtpUriHelper.GetWellUid(uri);

            Assert.Null(uid);
        }

        [Fact]
        public void GetWellboreUid_WellboreTokenPresent_ReturnsUid()
        {
            string uri = "eml://witsml14/well(well-123)/wellbore(wb-123)";

            string uid = EtpUriHelper.GetWellboreUid(uri);

            Assert.Equal("wb-123", uid);
        }

        [Fact]
        public void GetObjectUid_ObjectTypePresent_ReturnsUid()
        {
            string uri = "eml://witsml14/well(well-123)/wellbore(wb-123)/log(log-123)";

            string uid = EtpUriHelper.GetObjectUid(uri, EntityType.Log);

            Assert.Equal("log-123", uid);
        }

        [Fact]
        public void GetObjectUid_ObjectTypeMissing_ReturnsNull()
        {
            string uri = "eml://witsml14/well(well-123)/wellbore(wb-123)";

            string uid = EtpUriHelper.GetObjectUid(uri, EntityType.Log);

            Assert.Null(uid);
        }

        [Fact]
        public void GetObjectUid_CaseInsensitiveUri_ReturnsUid()
        {
            string uri = "eml://wITSML14/WeLL(well-123)/WEllBORE(wb-123)/LOg(log-123)";

            string uid = EtpUriHelper.GetObjectUid(uri, EntityType.Log);

            Assert.Equal("log-123", uid);
        }
    }
}
