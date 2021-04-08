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

### Run

Inside the root directory run:

```
npm start
```

If there were any new libraries installed you my need to run

```
npm ci
```

### Test

Inside the root directory run:

```
npm test
```

Note: there will be an error message after the tests finish running that you can ignore: ```Jest has detected the following 1 open handle potentially keeping Jest from exiting:```


If there were any new libraries installed you my need to run:

```
npm ci
```


# Endpoints

---

## De1 Endpoints

### Verify if a domain is safe (used by Proxy Server):
`GET /de1/verify/:proxyID`

Request Body:

`domainName String: the domain to verify`

`ipAddress String: the ip address of the device making to domain request`

Response:

```json
{    
    "domain": "String",
    "listType": "String",
}
```

---

## Activity Endpoints

### Log domain request (used by Proxy Server):
`POST /activity/log/:proxyID`

Request Body:

`listType String: the list the domain belongs to`

`domainName String: the name of the domain being logged`

`ipAddress String: the ip address of the device making to domain request`

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
            "ipAddress": "String"
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

## Domain Endpoints

### Get a user's Blacklist or Whitelist:
`GET /domain/:listType/:userID`

EXAMPLE: GET /domain/Whitelist/test-userID

RESPONSE: 
```json
{
    "Status": "Success or failed",
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

If the domain doesn't exist in the DB, it will create a new document for this domain.

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
    "Status": "Success or Failed",
    "msg": "",
    "domain": "domain Document"
}
```
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

## User Endpoints

### Registering a new User

`POST /user/register`

REQUETS BODY:
```json
{
    "userID": "ID from Google Login",
    "name": "Full name from Google Login"
}
```

RESPONSE If user already exists (CODE 409):
```json
{
    "msg": "User already exists",
    "user" {
        "userID": ,
        "name": ,
        "proxyID": 
    }
}
```

RESPONSE SUCCESS 
```json
{
    "msg": "Successful",
    "user" : {
        "userID": ,
        "name": ,
        "proxyID": 
    }
}
```

