// ReSharper disable ClassNeverInstantiated.Global
// ReSharper disable InconsistentNaming
namespace Witsml.ServiceReference
{
    internal interface IWitsmlResponse
    {
        public string GetResultCode();
    }

    public partial class WMLS_GetFromStoreResponse : IWitsmlResponse
    {
        public string GetResultCode() => Result.ToString();

        public override string ToString()
        {
            return $"Result: {Result}\nXMLout: {XMLout}\nSuppMsgOut: {SuppMsgOut}";
        }
    }

    public partial class WMLS_AddToStoreResponse : IWitsmlResponse
    {
        public string GetResultCode() => Result.ToString();
    }

    public partial class WMLS_UpdateInStoreResponse : IWitsmlResponse
    {
        public string GetResultCode() => Result.ToString();
    }

    public partial class WMLS_DeleteFromStoreResponse : IWitsmlResponse
    {
        public string GetResultCode() => Result.ToString();
    }

    public partial class WMLS_GetCapResponse : IWitsmlResponse
    {
        public string GetResultCode() => Result.ToString();
    }

    public partial class WMLS_GetVersionResponse : IWitsmlResponse
    {
        public string GetResultCode() => Result;
    }
}
