using System;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Channels;

using Serilog;

using Witsml.ServiceReference;

namespace Witsml;

public abstract class WitsmlClientBase
{
    internal static StoreSoapPortClient CreateSoapClient(WitsmlClientOptions options)
    {
        EndpointAddress endpointAddress = new(options.Hostname);

        Binding serviceBinding = CreateBinding(options);

        var client = new StoreSoapPortClient(serviceBinding, endpointAddress);
        client.ClientCredentials.UserName.UserName = options.Credentials.Username;
        client.ClientCredentials.UserName.Password = options.Credentials.Password;

        if (options.ClientCertificate != null)
        {
            client.ClientCredentials.ClientCertificate.Certificate = options.ClientCertificate;
            Log.Information($"Configured client to use client certificate. CN={options.ClientCertificate.SubjectName.Name}");
            if (!options.ClientCertificate.HasPrivateKey)
                Log.Warning("Configured client certificate does not contain a private key");
        }

        client.Endpoint.EndpointBehaviors.Add(new EndpointBehavior());

        return client;
    }

    private static BasicHttpsBinding CreateBasicBinding(TimeSpan requestTimeout)
    {
        return new BasicHttpsBinding
        {
            Security =
            {
                Mode = BasicHttpsSecurityMode.Transport,
                Transport =
                {
                    ClientCredentialType = HttpClientCredentialType.Basic
                }
            },
            MaxReceivedMessageSize = int.MaxValue,
            SendTimeout = requestTimeout
        };
    }

    private static Binding CreateBinding(WitsmlClientOptions options)
    {
        Uri uri = new(options.Hostname);
        var enableHttp = options.EnableHttp;
        if (uri.Scheme == "http" && enableHttp)
        {
            return CreateBasicHttpBinding(options.RequestTimeOut);
        }
        if (uri.Scheme == "https" && options.ClientCertificate == null)
        {
            return CreateBasicBinding(options.RequestTimeOut);
        }
        if (uri.Scheme == "https" && options.ClientCertificate != null)
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

    private static CustomBinding CreateCertificateAndBasicBinding()
    {
        return new CustomBinding
        {
            Elements =
            {
                new TextMessageEncodingBindingElement
                {
                    MessageVersion = MessageVersion.Soap11
                },
                new HttpsTransportBindingElement
                {
                    RequireClientCertificate = true,
                    AuthenticationScheme = AuthenticationSchemes.Basic,
                    MaxReceivedMessageSize = int.MaxValue
                }
            }
        };
    }
}
