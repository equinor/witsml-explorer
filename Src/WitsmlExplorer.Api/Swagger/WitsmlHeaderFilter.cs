using System.Collections.Generic;

using Microsoft.OpenApi.Models;

using Swashbuckle.AspNetCore.SwaggerGen;

using WitsmlExplorer.Api.HttpHandlers;

namespace WitsmlExplorer.Api.Swagger
{
    /// <summary>
    /// This class will add a Required HTTP Headers to SwaggerUI for all required endpoints,
    /// </summary>
    public class WitsmlHeaderFilter : IOperationFilter
    {
        private static readonly string AUTHORIZE_DESCRIPTION = """
            Include b64 encoded credentials.
            Example: 'dXNlcm5hbWU6cGFzc3dvcmQ=@https://witsml-explorer.serverhost.com/Store/WITSML'
        """;

        private static readonly string SERVER_DESCRIPTION = """
            Only use host url.
            Example: 'https://witsml-explorer.serverhost.com/Store/WITSML'
        """;

        private static readonly string USERNAME_DESCRIPTION = """
            Use the same username as the one passed in the WitsmlAuth header to the api/credentials/authorize route.
        """;

        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            List<string> nonWitsmlMethods = new() { typeof(WitsmlServerHandler).ToString(), typeof(AuthorizeHandler).ToString() };
            List<string> jobHandlerMethods = new() { typeof(JobHandler).ToString() };
            operation.Parameters ??= new List<OpenApiParameter>();
            bool noHeader = nonWitsmlMethods.Contains(context.MethodInfo.DeclaringType.FullName);
            bool jobHeaders = jobHandlerMethods.Contains(context.MethodInfo.DeclaringType.FullName);
            bool targetUsernameHeader = context.ApiDescription.RelativePath.Contains("wells");
            bool authorizeHeaders = context.ApiDescription.RelativePath.Contains("credentials/authorize");

            if (authorizeHeaders)
            {
                operation.Parameters.Add(new OpenApiParameter
                {
                    Name = EssentialHeaders.WitsmlAuthHeader,
                    In = ParameterLocation.Header,
                    Schema = new OpenApiSchema { Type = "string" },
                    Required = true,
                    Description = AUTHORIZE_DESCRIPTION
                });
            }
            else if (!noHeader)
            {
                operation.Parameters.Add(new OpenApiParameter
                {
                    Name = EssentialHeaders.WitsmlTargetServer,
                    In = ParameterLocation.Header,
                    Schema = new OpenApiSchema { Type = "string" },
                    Required = true,
                    Description = SERVER_DESCRIPTION
                });
                if (targetUsernameHeader)
                {
                    AddTargetUsernameHeader(operation);
                }
                else if (jobHeaders)
                {
                    AddTargetUsernameHeader(operation);
                    operation.Parameters.Add(new OpenApiParameter
                    {
                        Name = EssentialHeaders.WitsmlSourceServer,
                        In = ParameterLocation.Header,
                        Schema = new OpenApiSchema { Type = "string" },
                        Required = false,
                        Description = SERVER_DESCRIPTION

                    });
                    operation.Parameters.Add(new OpenApiParameter
                    {
                        Name = EssentialHeaders.WitsmlSourceUsername,
                        In = ParameterLocation.Header,
                        Schema = new OpenApiSchema { Type = "string" },
                        Required = false,
                        Description = USERNAME_DESCRIPTION
                    });
                }
            }
        }

        private static void AddTargetUsernameHeader(OpenApiOperation operation)
        {
            operation.Parameters.Add(new OpenApiParameter
            {
                Name = EssentialHeaders.WitsmlTargetUsername,
                In = ParameterLocation.Header,
                Schema = new OpenApiSchema { Type = "string" },
                Required = true,
                Description = USERNAME_DESCRIPTION
            });
        }
    }
}
