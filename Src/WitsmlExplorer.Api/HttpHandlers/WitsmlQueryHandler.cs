using System;
using System.Net;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Witsml;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class WitsmlQueryHandler
    {
        // file deepcode ignore XmlInjection: the incoming xml documents are only used to retrieve the query type that is sent further to the WITSML server

        [Produces(typeof(string))]
        public static async Task<IResult> AddToStore(IWitsmlClientProvider witsmlClientProvider, HttpRequest httpRequest)
        {
            IWitsmlClient witsmlClient = witsmlClientProvider.GetClient() ?? throw new WitsmlClientProviderException($"No WITSML access", (int)HttpStatusCode.Unauthorized, ServerType.Target);
            try
            {
                WitsmlQuery query = await httpRequest.Body.Deserialize<WitsmlQuery>();
                string result = await witsmlClient.AddToStoreAsync(query.Body, new OptionsIn(OptionsInString: query.OptionsInString));
                return TypedResults.Ok(result);
            }
            catch (Exception e)
            {
                return TypedResults.Ok(e.Message);
            }
        }

        [Produces(typeof(string))]
        public static async Task<IResult> DeleteFromStore(IWitsmlClientProvider witsmlClientProvider, HttpRequest httpRequest)
        {
            IWitsmlClient witsmlClient = witsmlClientProvider.GetClient() ?? throw new WitsmlClientProviderException($"No WITSML access", (int)HttpStatusCode.Unauthorized, ServerType.Target);
            try
            {
                WitsmlQuery query = await httpRequest.Body.Deserialize<WitsmlQuery>();
                string result = await witsmlClient.DeleteFromStoreAsync(query.Body, new OptionsIn(OptionsInString: query.OptionsInString));
                return TypedResults.Ok(result);
            }
            catch (Exception e)
            {
                return TypedResults.Ok(e.Message);
            }
        }

        [Produces(typeof(string))]
        public static async Task<IResult> GetFromStore(IWitsmlClientProvider witsmlClientProvider, HttpRequest httpRequest)
        {
            IWitsmlClient witsmlClient = witsmlClientProvider.GetClient() ?? throw new WitsmlClientProviderException($"No WITSML access", (int)HttpStatusCode.Unauthorized, ServerType.Target);
            try
            {
                WitsmlQuery query = await httpRequest.Body.Deserialize<WitsmlQuery>();
                string result = await witsmlClient.GetFromStoreAsync(query.Body, new OptionsIn(query.ReturnElements, OptionsInString: query.OptionsInString));
                return TypedResults.Ok(result);
            }
            catch (Exception e)
            {
                return TypedResults.Ok(e.Message);
            }
        }

        [Produces(typeof(string))]
        public static async Task<IResult> UpdateInStore(IWitsmlClientProvider witsmlClientProvider, HttpRequest httpRequest)
        {
            IWitsmlClient witsmlClient = witsmlClientProvider.GetClient() ?? throw new WitsmlClientProviderException($"No WITSML access", (int)HttpStatusCode.Unauthorized, ServerType.Target);
            try
            {
                WitsmlQuery query = await httpRequest.Body.Deserialize<WitsmlQuery>();
                string result = await witsmlClient.UpdateInStoreAsync(query.Body, new OptionsIn(OptionsInString: query.OptionsInString));
                return TypedResults.Ok(result);
            }
            catch (Exception e)
            {
                return TypedResults.Ok(e.Message);
            }
        }

    }
}
