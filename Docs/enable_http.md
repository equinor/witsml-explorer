# Enable HTTP WITSML servers

> :warning: **Using HTTP to connect to WITSML servers is not secure.** HTTP does not encrypt data, making it vulnerable to interception, tampering, and man-in-the-middle attacks. It is strongly recommended to use HTTPS, which encrypts communications, to protect against these risks.

## Implementation Details
If enabling HTTP between the API and your WITSML server is required, here is how to modify the service binding in the API to accommodate HTTP communication. The changes should be applied to `WitsmlClientBase.cs` in the API. With these changes, only the servers with a http-scheme will use http. If your server URL begins with https, it will still use secure communication.

```c#
// Modify the serviceBinding in the constructor.
Binding serviceBinding = CreateBinding(options);


// Add these two methods
private static Binding CreateBinding(WitsmlClientOptions options)
{
    Uri uri = new(options.Hostname);

    if (uri.Scheme == "http")
    {
        return CreateBasicHttpBinding(options.RequestTimeOut);
    }
    else if (uri.Scheme == "https" && options.ClientCertificate == null)
    {
        return CreateBasicBinding(options.RequestTimeOut);
    }
    else if (uri.Scheme == "https" && options.ClientCertificate != null)
    {
        return CreateCertificateAndBasicBinding();
    }
    throw new NotSupportedException($"No binding supported for the client options '{options}'.");
}

private static BasicHttpBinding CreateBasicHttpBinding(TimeSpan requestTimeout)
{
    return new BasicHttpBinding
    {
        Security =
        {
            Mode = BasicHttpSecurityMode.TransportCredentialOnly,
            Transport =
            {
                ClientCredentialType = HttpClientCredentialType.Basic
            }
        },
        MaxReceivedMessageSize = int.MaxValue,
        SendTimeout = requestTimeout
    };
}
```
