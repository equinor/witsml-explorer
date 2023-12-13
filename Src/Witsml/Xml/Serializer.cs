using System;
using System.IO;
using System.Text;
using System.Xml;
using System.Xml.Serialization;

namespace Witsml.Xml
{
    public static class XmlHelper
    {
        public static string Serialize<T>(T item, Boolean indentXml = false)
        {
            var settings = new XmlWriterSettings { OmitXmlDeclaration = true, Indent = indentXml };

            using var textWriter = new StringWriter();
            using var writer = XmlWriter.Create(textWriter, settings);

            var namespaces = new XmlSerializerNamespaces();
            namespaces.Add(string.Empty, "http://www.witsml.org/schemas/1series");

            var serializer = new XmlSerializer(item.GetType());
            serializer.Serialize(writer, item, namespaces);

            return textWriter.ToString();
        }

        public static T Deserialize<T>(string xmlString, T item)
        {
            var bytes = Encoding.UTF8.GetBytes(xmlString);
            using var stream = new MemoryStream(bytes);

            var serializer = new XmlSerializer(item.GetType());
            return (T)serializer.Deserialize(stream);
        }
    }
}
