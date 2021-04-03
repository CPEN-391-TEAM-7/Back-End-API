import requests
import json
import pandas as pd

from random import seed
from random import randint

seed(1)

URL = "https://securifyapi.online/activity/log/"

proxyID = "373be0e6-ccb4-4d0e-ac58-f6e6da75e8a0"

validListTypes = ["Whitelist", "Blacklist", "Safe", "Malicious", "Undefined"];


postBody = {
    "listType": "asdlfj",
    "domainName": "askvnae"
}

col_list = ["Rank","Root Domain","Linking Root Domains","Domain Authority"]

df = pd.read_csv("top500Domains.csv", usecols=col_list)

for domain in df["Root Domain"]:
    postBody["domainName"] = domain
    postBody["listType"] = validListTypes[randint(0,4)]
    response = requests.post(URL + proxyID, json.dumps(postBody))
    print(response.content)
    print(postBody)
