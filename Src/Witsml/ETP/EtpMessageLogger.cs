using System;
using System.Collections.Generic;

using Serilog;
using Serilog.Core;
using Serilog.Events;

namespace Witsml.ETP;

public interface IEtpMessageLogger
{
    /// <summary>
    /// Logs a raw ETP message payload together with basic header metadata when available.
    /// </summary>
    /// <param name="direction">Message direction (Sent/Received)</param>
    /// <param name="endpoint">ETP endpoint URI</param>
    /// <param name="header">ETP message header</param>
    /// <param name="body">ETP message body if available</param>
    void LogMessage(
        string direction,
        Uri endpoint,
        object header,
        object body);
}

public class DefaultEtpMessageLogger : IEtpMessageLogger
{
    private readonly Logger _logger;

    public DefaultEtpMessageLogger()
    {
        _logger = new LoggerConfiguration()
            .Destructure.With<SchemaOmittingDestructuringPolicy>()
            .WriteTo.File("etpMessages.log", rollOnFileSizeLimit: true, retainedFileCountLimit: 1, fileSizeLimitBytes: 50000000)
            .CreateLogger();
    }

    public void LogMessage(
        string direction,
        Uri endpoint,
        object header,
        object body)
    {
        _logger.Information(
            "Direction: {Direction}\nEndpoint: {Endpoint}\nHeader:\n{@Header}\nBody:\n{@Body}",
            direction,
            endpoint,
            header,
            body);
    }
}

public class SchemaOmittingDestructuringPolicy : IDestructuringPolicy
{
    public bool TryDestructure(
        object value,
        ILogEventPropertyValueFactory propertyValueFactory,
        out LogEventPropertyValue result)
    {
        result = null;
        if (value == null) return false;

        var type = value.GetType();
        var properties = type.GetProperties();

        var hasSchema = false;
        foreach (var property in properties)
        {
            if (string.Equals(property.Name, "Schema", StringComparison.OrdinalIgnoreCase))
            {
                hasSchema = true;
                break;
            }
        }

        if (!hasSchema) return false;

        var structuredProperties = new List<LogEventProperty>();
        foreach (var property in properties)
        {
            if (!property.CanRead) continue;
            if (property.GetIndexParameters().Length != 0) continue;
            if (string.Equals(property.Name, "Schema", StringComparison.OrdinalIgnoreCase)) continue;

            object propertyValue;
            try
            {
                propertyValue = property.GetValue(value);
            }
            catch
            {
                propertyValue = "<unavailable>";
            }

            structuredProperties.Add(new LogEventProperty(property.Name, propertyValueFactory.CreatePropertyValue(propertyValue, true)));
        }

        result = new StructureValue(structuredProperties, type.Name);
        return true;
    }
}
