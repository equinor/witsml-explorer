using System.Threading;
using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml;

public class CancellationTokenTests
{
    private readonly WitsmlClient _client;

    public CancellationTokenTests()
    {
        var config = ConfigurationReader.GetWitsmlConfiguration();
        _client = new WitsmlClient(options =>
        {
            options.Hostname = config.Hostname;
            options.Credentials = new WitsmlCredentials(config.Username, config.Password);
        });
    }

    [Fact(Skip = "Should only be run manually")]
    public async Task Verify_that_TaskCanceledException_IsThrown_OnCancellationTokenCancelled()
    {
        var query = new WitsmlWellbores
        {
            Wellbores =
            [
                new WitsmlWellbore { Name = "", IsActive = "true" }
            ]
        };
        var cts = new CancellationTokenSource();
        cts.CancelAfter(100);

        await Assert.ThrowsAsync<TaskCanceledException>(() =>
            _client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All),
                cts.Token));
    }

    [Fact(Skip = "Should only be run manually")]
    public async Task Verify_that_TaskCanceledException_IsNotThrown_IfQueryReturnsBeforeCancellation()
    {
        var query = new WitsmlWellbores
        {
            Wellbores =
            [
                new WitsmlWellbore { Name = "", IsActive = "true" }
            ]
        };
        var cts = new CancellationTokenSource();
        cts.CancelAfter(5000);

        var response = await _client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All), cts.Token);

        Assert.True(response.Wellbores.Count > 1);
    }
}
