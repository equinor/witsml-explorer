using System.Collections.Generic;

using Microsoft.OpenApi.Models;

using Swashbuckle.AspNetCore.SwaggerGen;

namespace WitsmlExplorer.Api.Swagger
{
    /// <summary>
    /// This class will add a Required HTTP Header `Witsml-ServerUrl` and `Witsml-Source-ServerUrl`to SwaggerUI for all required endpoints,
    /// </summary>
    public class WitsmlHeaderFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            List<string> emptyHeader = new() { typeof(HttpHandlers.AuthorizeHandler).ToString(), typeof(HttpHandlers.WitsmlServerHandler).ToString() };
            List<string> witsmlSourceHeader = new() { typeof(HttpHandlers.JobHandler).ToString() };
            if (operation.Parameters == null)
            {
                operation.Parameters = new List<OpenApiParameter>();
            }
            bool noHeader = emptyHeader.Contains(context.MethodInfo.DeclaringType.FullName);
            bool sourceServerHeader = witsmlSourceHeader.Contains(context.MethodInfo.DeclaringType.FullName);
            if (!noHeader)
            {
                operation.Parameters.Add(new OpenApiParameter
                {
                    Name = "Witsml-ServerUrl",
                    In = ParameterLocation.Header,
                    Schema = new OpenApiSchema { Type = "string" },
                    Required = true
                });
                if (sourceServerHeader)
                {
                    operation.Parameters.Add(new OpenApiParameter
                    {
                        Name = "Witsml-Source-ServerUrl",
                        In = ParameterLocation.Header,
                        Schema = new OpenApiSchema { Type = "string" },
                        Required = false
                    });
                }
            }
        }
    }
}
