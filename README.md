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

## Endpoints

### Verify if a domain is safe (used by Proxy Server):
`GET /de1/verify/:proxyID?domain=<domainName>`

```
{    
    domain: String,
    safe: Number,   // 1 for safe, 0 for unsafe
}
```

### Get recent activity:
`GET /activity/recent/:userID`

Request Body:

`startDate Datetime: datetime to start querying backwards from (inclusive)`

`endDate Datetime?: (optional) datetime to query forwards from (inclusive)`

`limit Integer?: (optional) how many domain requests to return`

`listTypes Array[String]?: (optional) filter domain requests by list types (WhiteList, BlackList, Safe, Malicious, or Undefined)`

```
{
    activities: [
        {
            "status": String,
            "activityID": String,
            "domainID": String,
            "domainName": String,
            "proxyID": String,
            "timestamp": Datetime,
        },
        ...
    ],
    "lastEndDate": Datetime, // the timestamp of the oldest activity
    "count": Integer // total activities returned
}
```

### Get a user's blacklist:
`GET /domain/blacklist?userId=<userID>`

```
{
    blacklist: [
        {
            domainID: String,
            domainName: String,
        },
        {
            domainID: String,
            domainName: String,
        },
        {
            domainID: String,
            domainName: String,
        },
    ],
}
```

### Get a user's whitelist:
`GET /domain/whitelist?userId=<userID>`

```
{
    whitelist: [
        {
            domainID: String,
            domainName: String,
        },
        {
            domainID: String,
            domainName: String,
        },
        {
            domainID: String,
            domainName: String,
        },
    ],
}
```

### Get a domain's status:
`GET /domain?userId=<userID>&domainName=<domainName>`

```
{
    domainID: String,
    domainName: String,
    listType: String,
}
```

### Add a new domain to a user's list of domains:
`POST /domain?userId=<userID>&domainName=<domainName>&listType=<listType>`

### Blacklist a domain for a user:
`PUT /domain?userId=<userID>&listType=blacklist`

### Blacklist a domain for a user:
`PUT /domain?userId=<userID>&listType=whitelist`
