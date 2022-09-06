using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace WitsmlExplorer.Api.Extensions
{
    public static class StreamExtensions
    {
        public static async Task<T> Deserialize<T>(this Stream stream)
        {
            return await JsonSerializer.DeserializeAsync<T>(stream, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        }
    }
}
