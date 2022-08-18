using System.Collections.Generic;

using Microsoft.OpenApi.Models;

using Swashbuckle.AspNetCore.SwaggerGen;

namespace WitsmlExplorer.Api.Swagger;

/// <summary>
/// This class will add a Required HTTP Header `Witsml-ServerUrl` to SwaggerUI for all endpoints except where it is not needed
/// </summary>
public class WitsmlHeaderFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var noHeader = new List<string>() { "WitsmlExplorer.Api.HttpHandler.AuthorizeHandler", "WitsmlExplorer.Api.HttpHandler.WitsmlServerHandler" };
        if (operation.Parameters == null)
            operation.Parameters = new List<OpenApiParameter>();

        if (!noHeader.Contains(context.MethodInfo.DeclaringType.FullName))
        {
            operation.Parameters.Add(new OpenApiParameter
            {
                Name = "Witsml-ServerUrl",
                In = ParameterLocation.Header,
                Schema = new OpenApiSchema { Type = "string" },
                Required = true
            });
        }
    }
}
