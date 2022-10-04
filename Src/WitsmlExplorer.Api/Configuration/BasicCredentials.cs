using System;
using System.Text;

namespace WitsmlExplorer.Api.Configuration
{
    public class BasicCredentials : ICredentials
    {
        public string UserId { get; init; }
        public string Password { get; init; }
        public BasicCredentials() { }
        public BasicCredentials(string base64EncodedString)
        {
            string credentialString = Encoding.UTF8.GetString(Convert.FromBase64String(base64EncodedString));
            string[] credentials = credentialString.Split(new[] { ':' }, 2);
            UserId = credentials[0];
            Password = credentials[1];
        }

        public BasicCredentials(string username, string password)
        {
            UserId = username;
            Password = password;
        }
        public bool IsNullOrEmpty()
        {
            return string.IsNullOrEmpty(UserId) || string.IsNullOrEmpty(Password);
        }
    }
}
