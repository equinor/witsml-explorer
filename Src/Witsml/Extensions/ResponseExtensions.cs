using Witsml.ServiceReference;

namespace Witsml.Extensions
{
    public static class ResponseExtensions
    {
        public static bool IsSuccessful(this WMLS_GetFromStoreResponse response)
            => response.Result > 0;

        public static bool IsSuccessful(this WMLS_AddToStoreResponse response)
            => response.Result > 0;

        public static bool IsSuccessful(this WMLS_UpdateInStoreResponse response)
            => response.Result > 0;

        public static bool IsSuccessful(this WMLS_DeleteFromStoreResponse response)
            => response.Result > 0;

        public static bool IsSuccessful(this WMLS_GetCapResponse response)
            => response.Result > 0;
    }
}
