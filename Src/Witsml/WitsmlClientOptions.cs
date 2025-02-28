using System;
using System.Security.Cryptography.X509Certificates;

using Witsml.Data;

namespace Witsml;

public class WitsmlClientOptions
{
    /// <summary>
    /// Hostname of the WITSML server to connect to
    /// </summary>
    public string Hostname { get; set; }

    /// <summary>
    /// Client credentials to be used for basic authentication with the WITSML server
    /// </summary>
    public WitsmlCredentials Credentials { get; set; }

    /// <summary>
    /// Optional. Client certificate to present while connecting to the WITSML server. The certificate should contain the private key.
    /// </summary>
    public X509Certificate2 ClientCertificate { get; set; }

    /// <summary>
    /// The client capabilities to present to the WITSML server
    /// <see cref="WitsmlClientCapabilities" />
    /// </summary>
    public WitsmlClientCapabilities ClientCapabilities { get; set; } = new();

    /// <summary>
    /// The timeout interval to be used when communicating with the WITSML server. Default is 00:01:00 minutes
    /// </summary>
    public TimeSpan RequestTimeOut { get; set; } = TimeSpan.FromSeconds(CommonConstants.DefaultClientRequestTimeOutSeconds);

    /// <summary>
    /// Enable logging all queries to a file (queries.log) in the current directory
    /// </summary>
    public bool LogQueries { get; set; }

    /// <summary>
    ///
    /// </summary>
    public bool EnableHttp { get; set; }
}

public record WitsmlCredentials(string Username, string Password);
