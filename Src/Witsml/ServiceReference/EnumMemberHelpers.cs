using System;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;

namespace Witsml.ServiceReference
{
    public static class EnumMemberToString
    {
        public static string GetEnumMemberValue<T>(this T value) where T : Enum
        {
            return typeof(T)
                .GetTypeInfo()
                .DeclaredMembers
                .SingleOrDefault(x => x.Name == value.ToString())
                ?.GetCustomAttribute<EnumMemberAttribute>(false)
                ?.Value;
        }
    }

    public static class EnumParser<T> where T : Enum
    {
        public static T GetEnum(string enumMemberValue)
        {
            string stringValue = typeof(T)
                .GetTypeInfo()
                .DeclaredMembers
                .Where(member => member.GetCustomAttribute<EnumMemberAttribute>(false)?.Value == enumMemberValue)
                .Select(f => f.Name)
                .FirstOrDefault();

            return !string.IsNullOrEmpty(stringValue)
                ? (T)Enum.Parse(typeof(T), stringValue)
                : throw new ArgumentException($"No members of {typeof(T).Name} has a specified EnumMember value of '{enumMemberValue}'");
        }
    }
}
