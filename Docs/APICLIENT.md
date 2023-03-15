# API Client

This document describes how to connect to the API with a custom client written in either `C#` or `Python`

For detailed API specification, visit Swagger on url `/swagger/index.html` on your running instance.

Extra care handling secrets has not been given in the examples below, and will be up to the end user to implement.

## C#
**Prerequisite:**
witsml-explorer started in Basic authentication mode (`OAuth2Enabled=false`) running on `localhost`.

In the example below we will first contact the backend to verify access to the WITSML server with the given credentials. The cookie we get in return will be used as authorization later when using endpoints.
```csharp

// 1. get authorization cookie

string url = "https://localhost:5001/api/credentials/authorize?keep=false";
var witsmlServer="https://witsml-server.com";
var witsmluser = "witsmlusername";
var witsmlpass = "witsmlpassword";
var credentials = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{witsmluser}:{witsmlpass}"));

using var httpClient = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.Get, url);
request.Headers.Add("WitsmlAuth", $"{credentials}@{witsmlServer}");

var response = httpClient.Send(request); 
var setCookie = response.Headers.FirstOrDefault(n=> n.Key == "Set-Cookie").Value.ToList()[0];
var (cookiename, cookieval) = (setCookie.Split(";")[0].Split("=")[0],setCookie.Split(";")[0].Split("=")[1]);

// 2. query endpoints, in this case get all wells

var endpoint = "https://localhost:5001/api/wells";
request = new HttpRequestMessage(HttpMethod.Get, endpoint);
request.Headers.Add("WitsmlTargetServer", $"{witsmlServer}");
request.Headers.Add("WitsmlTargetUsername", $"{witsmluser}");
request.Headers.Add("Cookie",$"{cookiename}={cookieval}");

response = httpClient.Send(request); 
using var reader = new StreamReader(response.Content.ReadAsStream());
var responseBody = reader.ReadToEnd();

Console.WriteLine(responseBody);

```

## Python 
**Prerequisite:**
witsml-explorer started in Basic authentication mode (`OAuth2Enabled=false`) running on `localhost`.

In the example below we will first contact the backend to verify access to the WITSML server with the given credentials. The cookie we get in return will be used as authorization later when using endpoints.
```py
import base64, requests

# 1. get authorization cookie

witsmluser="witsmlusername"
witsmlpass = "witsmlpassword";
credentials = base64.b64encode(f"{witsmluser}:{witsmlpass}".encode()).decode()
url = "https://localhost:5001/api/credentials/authorize"
witsmlserver= "https://witsml-server.com"
params = {  "keep": "false" }
headers = { "WitsmlAuth": f"{credentials}@{witsmlserver}" }
cookies = {'witsmlexplorer': ''}
ca_certs = "localhost.pem" # For local dev-certs, in case of https

try:
    response = requests.get( url=url, params=params, headers=headers, verify=ca_certs )
    cookies["witsmlexplorer"] = response.cookies["witsmlexplorer"]
except requests.exceptions.RequestException as e:
    print('RequestException: ',e)

# 2. query endpoints

endpoint = "http://localhost:5000/api/wells"
headers = { 
    "WitsmlTargetServer": f"{witsmlserver}", 
    "WitsmlTargetUsername": f"{witsmluser}" 
}

try:
    response = requests.get( url=endpoint, headers=headers, cookies=cookies )
    print(response.status_code);
    print('Response HTTP Response Body: {content}'.format( content=response.content))    
except requests.exceptions.RequestException as e:
    print('RequestException: ',e)

```

For running instances where `OAuth2Enabled=true` the same code can be used, but without any cookies and including a `Bearer` token from your identityprovider added in the `Authorization` Header. 
