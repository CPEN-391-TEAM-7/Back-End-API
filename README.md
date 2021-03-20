# Backend

## Steps for local use (Mac)

### Setup

Inside the cloned directory run:

```
npm ci
```

Then:

```
brew install mongodb/brew/mongodb-community
```

Next:

```
mongo
```

Inside the mongo interface:

```
use Securify
```

### Use

Inside the cloned directory run:

```
npm start
```

If there were any new libraries installed you my need to run

```
npm ci
```

# Endpoints

### Verify if a domain is safe (used by Proxy Server):
`GET /de1/verify/:proxyID?domain=<domainName>`

Response:

```json
{    
    "domain": "String",
    "safe": "Number",   // 1 for safe, 0 for unsafe
}
```

---
### Log domain request (used by Proxy Server):
`POST /activity/log/:proxyID`

Request Body:

`listType String: the list the domain belongs to`

`domainName String: the name of the domain being logged`

---
### Get recent domain request activity:
`GET /activity/recent/:userID`

Request Body:

`startDate Datetime: datetime to start querying backwards from (inclusive)`

`endDate Datetime?: (optional) datetime to query forwards from (inclusive)`

`limit Integer?: (optional) how many domain requests to return`

`listTypes Array[String]?: (optional) filter domain requests by list types (Whitelist, Blacklist, Safe, Malicious, or Undefined)`

Example Body:

```json
{
    "startDate": "2021-03-20T10:11:36.251Z",
    "endDate": "2021-03-01T10:11:36.251Z",
    "limit": 50,
    "listTypes": ["Safe", "Whitelist"]
}
```

Response:

```json
{
    "activities": [
        {
            "listType": "String",
            "domainName": "String",
            "timestamp": "Datetime",
        },
        ...
    ],
    "lastEndDate": "Datetime", // the timestamp of the oldest activity
    "count": "Integer" // total activities returned
}
```

---
### Get all time most requested domains:
`GET /activity/allTimeMostRequested/:userID`

Request Body:

`limit Integer: how many domains to return`

`listTypes Array[String]?: (optional) filter domains by list types (Whitelist, Blacklist, Safe, Malicious, or Undefined)`

Example Body:
```json
{
    "startDate": "2021-03-20T10:11:36.251Z",
    "endDate": "2021-03-01T10:11:36.251Z",
    "limit": 50,
    "listTypes": ["Safe", "Whitelist"]
}
```

Response:

```json
{
    "domains": [
        {
            "domainName": "String",
            "listType": "String",
            "num_of_accesses": "Integer"
        },
        ...
    ]
}
```

---
### Get most requested domains between two dates:
`GET /activity/mostRequested/:userID`

Request Body:

`startDate Datetime: datetime to start querying backwards from (inclusive)`

`endDate Datetime: datetime to query forwards from (inclusive)`

`limit Integer?: (optional) how many domains to return`

`listTypes Array[String]?: (optional) filter domains by list types (Whitelist, Blacklist, Safe, Malicious, or Undefined)`

Example Body:
```json
{
    "startDate": "2021-03-20T10:11:36.251Z",
    "endDate": "2021-03-01T10:11:36.251Z",
    "limit": 50,
    "listTypes": ["Safe", "Whitelist"]
}
```

Response:

```json
[
    [
        "<domainName>",
        {
            "count": "Integer",
            "listType": "String"
        },
    ],
    [
        "<domainName>",
        {
            "count": "Integer",
            "listType": "String"
        },
    ]
    ...
]
```

---
### Get a user's Blacklist or Whitelist:
`GET /domain/:listType/:userID`

RESPONSE: 
```json
{
    "msg": "success or failed"
    "list": [
        {
            "domainID": "String",
            "domainName": "String",
        },
        {
            "domainID": "String",
            "domainName": "String",
        },
        {
            "domainID": "String",
            "domainName": "String",
        },
    ],
}
```

___

### Add a domain to a list
`PUT /domain/update`

BODY:
```json
{
    "userID": "id of the user",
    "listType": "list you want to add to",
    "domainName": "name of the domain"
}
```

RESPONSE:
```json
{
    "msg": "Success",
    "domain": "domain Object"
}
```
<!-- ### Get a user's Whitelist:

`GET /domain/Whitelist/:userID`

BODY:
```json
{
    "listType": "Whitelist",
}
```


RESPONSE:

```json
{
    "Whitelist": [
        {
            "domainID": "String",
            "domainName": "String",
        },
        {
            "domainID": "String",
            "domainName": "String",
        },
        {
            "domainID": "String",
            "domainName": "String",
        },
    ],
}
``` -->
---
### Get a domain's status:

`GET /domain?userId=<userID>&domainName=<domainName>`

```json
{
    "domainID": "String",
    "domainName": "String",
    "listType": "String",
}
```
---
### Add a new domain to a user's list of domains:

`POST /domain?userId=<userID>&domainName=<domainName>&listType=<listType>`

---
#### Blacklist a domain for a user:

`PUT /domain?userId=<userID>&listType=Blacklist`

---
#### Blacklist a domain for a user:

`PUT /domain?userId=<userID>&listType=Whitelist`

