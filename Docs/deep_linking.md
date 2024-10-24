# URL structure for deeplinking

 This describes the structure of the URL so that it is easy for developers to create deep links from other applications directly to a well/wellbore/object/curve data etc.

## Paramemter encoding:

All server and uid parameters must be URL encoded. 

## Common parameters:
### objectGroup

This paramater can have values:
  - BhaRun
  - ChangeLog
  - FluidsReport
  - FormationMarker
  - Message
  - MudLog
  - Log
  - Rig
  - Risk
  - Trajectory
  - Tubular
  - WbGeometry

### logType

This paramater can have values:
  - time
  - depth

### filterType

This paramater can have values:
  - Wellbore
  - Log
  - Rig
  - Service%20Company

## Navigation paths:

### Wells View

```/servers/:serverUrl/wells```

### Wellbores View

```/servers/:serverUrl/wells/:wellUid/wellbores```

### Object Groups

```/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups```

### Objects View

```/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects```

### Object View

```/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects/:objectUid```

### Log Types View

```/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes```

### Log Objects View

```/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects```

### Log Object View

```/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid```

### Filtering Rows Of Views

Most pages can receive a filter to filter the rows of the table in that page. Those filters are added at the end of the url.
For example showing only rows where parameter "name" has value "test":

```?filter={"name":"test"}```

Url encoded version which needs to be used:

```?filter=%7B%22name%22%3A%22test%22%7D```


### Log Curve Values View

```/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid/curvevalues?startIndex=<start index>&endIndex=<end index>&mnemonics=<mnemonics>```

#### Additional params for limiting the data to the given range and mnemonics

If there is a need to limit the data in result, following parameters need to be filled up:

  - startIndex
  - endIndex
  - mnemonics

StartIndex and endIndex could be numbers for depth based logs or datetime in ISO format  - "YYYY-MM-DDTHH:mm:ss.sssZ" for time based logs.
Note that full url should not exceed the maximum url length accepted by most browsers - in Witsml Explorer we support maximum 2000 characters.

Samples:

##### Time sample:

```?startIndex=2024-09-06T00:00:00Z&endIndex=2024-09-06T00:01:00Z&mnemonics=["mnem1","mnem2","mnem3","mnem4"]```

url encoded version which should be used:

```?startIndex=2024-09-06T00%3A00%3A00Z&endIndex=2024-09-06T00%3A01%3A00Z&mnemonics=%5B%22mnem1%22%2C%22mnem2%22%2C%22mnem3%22%2C%22mnem4%22%5D```

In the sample above we combine mnemonics "mmem1", "mmem2", "mmem3", "mmen4" for the selected time interval

##### Depth sample:

```?startIndex=1&endIndex=4&mnemonics=["mnem1","mnem2","mnem3","mnem4"]```

url encoded version which should be used:

```?startIndex=1&endIndex=5&mnemonics=%5B%22mnem1%22%2C%22mnem2%22%2C%22mnem3%22%2C%22mnem4%22%5D```

### Multi Logs Curve Info List View

```/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/multilogs?logs=<log uids>```


#### Additional params to specify which logs to combine

The logs param must be used to specify which logs should be combined in the multi-log view

Sample:

```?logs=["323f827b-c849-4b14-a1c3-ba207848f29c","701f5f00-bdb5-4937-8350-1975240ce432"]```
 
and url-encoded version, which should be used:

```?logs=%5B%22323f827b-c849-4b14-a1c3-ba207848f29c%22%2C%22701f5f00-bdb5-4937-8350-1975240ce432%22%5D```

In the sample above we combine 2 logs with uid "323f827b-c849-4b14-a1c3-ba207848f29c" and with uid "701f5f00-bdb5-4937-8350-1975240ce432".


### Multi Logs Curve Values

```/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/multilogs/curvevalues?startIndex=<start index>&endIndex=<end index>&mnemonics=<mnemonics for each log>```

#### Additional params for limiting the data in result

If there is a need to limit the data in result, following parameters need to be filled up:

  - startIndex
  - endIndex
  - mnemonics

StartIndex and endIndex could be numbers for depth based logs or datetime in ISO format  - "YYYY-MM-DDTHH:mm:ss.sssZ" for time based logs

Samples:

##### Time sample:

```?startIndex=2024-09-06T00:00:00.000Z&endIndex=2024-09-06T00:01:00.000Z&mnemonics={"323f827b-c849-4b14-a1c3-ba207848f29c":["mnem1"],"701f5f00-bdb5-4937-8350-1975240ce432":["mnem2"]}```

url encoded version which should be used:

```?startIndex=2024-09-06T00%3A00%3A00.000Z&endIndex=2024-09-06T00%3A01%3A00.000Z&mnemonics=%7B%22323f827b-c849-4b14-a1c3-ba207848f29c%22%3A%5B%22mnem1%22%5D%2C%22701f5f00-bdb5-4937-8350-1975240ce432%22%3A%5B%22mnem2%22%5D%7D```

In the sample above we combine mnemonics "mmem1" from log with uid "323f827b-c849-4b14-a1c3-ba207848f29c" and "mmem2" from log with uid "701f5f00-bdb5-4937-8350-1975240ce432".

##### Depth sample:

```?startIndex=1&endIndex=4&mnemonics={"55823e08-6232-43a8-8e77713bc469-6674":["mnem3"],"bc498d56-84f6-4c63-b1af-d845be3e6961":["mnem4"]}```

url encoded version which should be used:

```?startIndex=1&endIndex=4&mnemonics=%7B%2255823e08-6232-43a8-8e77713bc469-6674%22%3A%5B%22mnem3%22%5D%2C%22bc498d56-84f6-4c63-b1af-d845be3e6961%22%3A%5B%22mnem4%22%5D%7D%0A```

### Jobs View

```/servers/:serverUrl/jobs```

### Query View

```/servers/:serverUrl/query```

### Search View

```/servers/:serverUrl/search/:filterType```
