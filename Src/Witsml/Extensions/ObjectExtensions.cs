using System.Text;

namespace Witsml.Extensions
{
    public static class ObjectExtensions
    {
        public static string PrintProperties(this object obj)
        {
            var props = obj.GetType().GetProperties();
            var sb = new StringBuilder();
            foreach (var p in props)
            {
                sb.AppendLine(p.Name + ": " + p.GetValue(obj, null));
            }
            return sb.ToString();
        }
    }
}
