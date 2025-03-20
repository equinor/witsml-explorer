using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using Witsml.Xml;

using WitsmlExplorer.Api.Query;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public partial class AttachmentTests
    {
        private readonly WitsmlClient _client;

        public AttachmentTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetAttachmentSerializesCorrectly()
        {
            // if the following attachment does not exit, add the file attachment to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            string wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            string wellboreUid = "ae75db48-5cef-4bd1-9ddf-6035b0d2cd49";
            string attachmentUid = "attachmentUid";
            WitsmlAttachments queryExisting = AttachmentQueries.GetWitsmlAttachment(wellUid, wellboreUid, attachmentUid);
            WitsmlAttachments serverAttachment = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string responseXml = XmlHelper.Serialize(serverAttachment);
            string serverAttachmentXml = TestUtils.CleanResponse(responseXml);
            string fileAttachmentXml = TestUtils.GetTestXml("Attachment");
            Assert.Equal(fileAttachmentXml, serverAttachmentXml);
        }
    }
}
