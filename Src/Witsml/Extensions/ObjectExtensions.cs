using System.Text;

namespace Witsml.Extensions
{
    public static class ObjectExtensions
    {
        public static string PrintProperties(this object obj)
        {
            System.Reflection.PropertyInfo[] props = obj.GetType().GetProperties();
            StringBuilder sb = new();
            foreach (System.Reflection.PropertyInfo p in props)
            {
                sb.AppendLine(p.Name + ": " + p.GetValue(obj, null));
            }
            return sb.ToString();
        }
    }
}
