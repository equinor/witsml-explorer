// ReSharper disable ClassNeverInstantiated.Global
// ReSharper disable InconsistentNaming
namespace Witsml.ServiceReference
{
    internal interface IWitsmlResponse
    {
        public short GetResultCode();
    }

    public partial class WMLS_GetFromStoreResponse : IWitsmlResponse
    {
        public short GetResultCode() => Result;

        public override string ToString()
        {
            return $"Result: {Result}\nXMLout: {XMLout}\nSuppMsgOut: {SuppMsgOut}";
        }
    }

    public partial class WMLS_AddToStoreResponse : IWitsmlResponse
    {
        public short GetResultCode() => Result;
    }

    public partial class WMLS_UpdateInStoreResponse : IWitsmlResponse
    {
        public short GetResultCode() => Result;
    }

    public partial class WMLS_DeleteFromStoreResponse : IWitsmlResponse
    {
        public short GetResultCode() => Result;
    }

    public partial class WMLS_GetCapResponse : IWitsmlResponse
    {
        public short GetResultCode() => Result;
    }
}
