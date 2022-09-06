using Witsml.ServiceReference;

namespace Witsml.Extensions
{
    public static class ResponseExtensions
    {
        public static bool IsSuccessful(this WMLS_GetFromStoreResponse response)
        {
            return response.Result > 0;
        }

        public static bool IsSuccessful(this WMLS_AddToStoreResponse response)
        {
            return response.Result > 0;
        }

        public static bool IsSuccessful(this WMLS_UpdateInStoreResponse response)
        {
            return response.Result > 0;
        }

        public static bool IsSuccessful(this WMLS_DeleteFromStoreResponse response)
        {
            return response.Result > 0;
        }

        public static bool IsSuccessful(this WMLS_GetCapResponse response)
        {
            return response.Result > 0;
        }
    }
}
