# URL structure for deeplinking

 This describes the structure of the URL so that it is easy for developers to create deep links from other applications directly to a well/wellbore/object/curve data etc.

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
  - Log
  - Group
  - ServiceCompany

## Navigation paths:

### Wells View
/servers/:serverUrl/wells

### Wellbores View
/servers/:serverUrl/wells/:wellUid/wellbores

### Object Groups
/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups

### Objects View
/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects

### Object View
/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/objects/:objectUid

### Log Types View
/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes

### Log Objects View
/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid

### Log Object View
/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid/curvevalues

### Log Curve Values View
/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/objects/:objectUid/curvevalues

### Multi Logs Curve Info List View
/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/multilogs"

### Multi Logs Curve Values
/servers/:serverUrl/wells/:wellUid/wellbores/:wellboreUid/objectgroups/:objectGroup/logtypes/:logType/multilogs/curvevalues"

### Jobs View
/servers/:serverUrl/jobs

### Query View
/servers/:serverUrl/query

### Search View
/servers/:serverUrl/search/:filterType

