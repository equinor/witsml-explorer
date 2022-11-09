using System.Collections.Generic;

using Microsoft.OpenApi.Models;

using Swashbuckle.AspNetCore.SwaggerGen;

using WitsmlExplorer.Api.HttpHandlers;

namespace WitsmlExplorer.Api.Swagger
{
    /// <summary>
    /// This class will add a Required HTTP Header `WitsmlTargetServer` and `WitsmlSourceServer`to SwaggerUI for all required endpoints,
    /// </summary>
    public class WitsmlHeaderFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            List<string> emptyHeader = new() { typeof(WitsmlServerHandler).ToString() };
            List<string> witsmlSourceHeader = new() { typeof(JobHandler).ToString() };
            operation.Parameters ??= new List<OpenApiParameter>();
            bool noHeader = emptyHeader.Contains(context.MethodInfo.DeclaringType.FullName);
            bool sourceServerHeader = witsmlSourceHeader.Contains(context.MethodInfo.DeclaringType.FullName);
            if (!noHeader)
            {
                operation.Parameters.Add(new OpenApiParameter
                {
                    Name = EssentialHeaders.WitsmlTargetServer,
                    In = ParameterLocation.Header,
                    Schema = new OpenApiSchema { Type = "string" },
                    Required = true
                });
                if (sourceServerHeader)
                {
                    operation.Parameters.Add(new OpenApiParameter
                    {
                        Name = EssentialHeaders.WitsmlSourceServer,
                        In = ParameterLocation.Header,
                        Schema = new OpenApiSchema { Type = "string" },
                        Required = false
                    });
                }
            }
        }
    }
}
