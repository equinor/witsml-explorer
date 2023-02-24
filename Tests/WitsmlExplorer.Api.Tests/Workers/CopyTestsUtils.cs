using System.Collections.Generic;

using Moq;

using Witsml;
using Witsml.Data;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CopyTestsUtils
    {
        public static IEnumerable<T> SetupAddInStoreAsync<T>(Mock<IWitsmlClient> witsmlClient) where T : IWitsmlQueryType
        {
            List<T> addedObject = new();
            witsmlClient.Setup(client => client.AddToStoreAsync(It.IsAny<IWitsmlQueryType>()))
                .Callback<IWitsmlQueryType>((o) => addedObject.Add((T)o))
                .ReturnsAsync(new QueryResult(true));
            return addedObject;
        }
    }
}
