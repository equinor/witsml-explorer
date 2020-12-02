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

            var serializer = new XmlSerializer(typeof(T));
            serializer.Serialize(writer, item);

            return textWriter.ToString();
        }

        public static T Deserialize<T>(string xmlString)
        {
            var bytes = Encoding.UTF8.GetBytes(xmlString);
            using var stream = new MemoryStream(bytes);

            var serializer = new XmlSerializer(typeof(T));
            return (T) serializer.Deserialize(stream);
        }
    }
}
