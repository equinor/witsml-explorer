using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Witsml.ServiceReference;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class WitsmlQueryHandler
    {

        [Produces(typeof(string))]
        public static async Task<IResult> PostQuery(IWitsmlClientProvider witsmlClientProvider, HttpRequest httpRequest)
        {
            try
            {
                WitsmlQuery query = await httpRequest.Body.Deserialize<WitsmlQuery>();
                // file deepcode ignore XmlInjection: the body is only used to retrieve the query type that is sent further to the WITSML server
                string result = await witsmlClientProvider.GetClient().GetFromStoreAsync(query.Body, new OptionsIn(query.ReturnElements));
                return TypedResults.Ok(result);
            }
            catch (Exception e)
            {
                return TypedResults.Ok(e.Message);
            }
        }

    }
}
