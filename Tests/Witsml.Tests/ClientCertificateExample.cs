using System;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace Witsml.Tests;

public class ClientCertificateExample
{
    /// <summary>
    /// This is just a sample of how to create a X509Certificate client certificate that can be provided to the WitsmlClient
    /// </summary>
    public void CreateCertificate()
    {
        var clientCertificateString = "---BEGIN CERTIFICATE--- <certificate> ---END CERTIFICATE---";
        var privateKey = "<certificate key>"; // note that ---BEGIN PRIVATE KEY--- / ---END PRIVATE KEY--- is not included

        var clientCertificate = X509Certificate2.CreateFromPem(clientCertificateString);

        var key = RSA.Create();
        key.ImportPkcs8PrivateKey(Convert.FromBase64String(privateKey), out _);

        clientCertificate = clientCertificate.CopyWithPrivateKey(key);
    }
}
