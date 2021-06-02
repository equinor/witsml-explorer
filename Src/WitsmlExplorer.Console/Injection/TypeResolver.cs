using System;
using Microsoft.Extensions.DependencyInjection;
using Spectre.Console.Cli;

namespace WitsmlExplorer.Console.Injection
{
    public sealed class TypeResolver : ITypeResolver, IDisposable
    {
        private readonly IServiceProvider provider;

        public TypeResolver(IServiceProvider provider)
        {
            this.provider = provider ?? throw new ArgumentNullException(nameof(provider));
        }

        public object Resolve(Type type)
        {
            return provider.GetRequiredService(type);
        }

        public void Dispose()
        {
            if (provider is IDisposable disposable)
            {
                disposable.Dispose();
            }
        }
    }
}
