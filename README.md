# WebApp

## Endpoints

Example:

`get/blacklist`

```
{
    blacklist: [
        www.asdfavnk.info,
        www.knjfnbjf.info,
    ],
    timestamp: ,
}
```

`get/whitelist`

```
{
    whitelist: [
        www.google.com,
        www.ubc.ca,
    ],
    timestamp: ,
}
```

`get/malware?<domain name>`

```
{
    timestamp: ,
}
```

`get/ok?<domain name>`

```
{
    timestamp: 111111,
}
