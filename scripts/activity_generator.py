import requests
import json
import pandas as pd

from random import seed
from random import randint

seed(1)

URL = "https://securifyapi.online/activity/log/"

proxyID = "373be0e6-ccb4-4d0e-ac58-f6e6da75e8a0"

validListTypes = ["Whitelist", "Blacklist", "Safe", "Malicious", "Undefined"]

ipAdresses = ["124.156.83.12", "184.255.73.47", "43.89.33.111", "211.33.60.246", "97.23.45.201"]

postBody = {
    "listType": "Whitelist",
    "domainName": "google.com",
    "ipAddress": "0.0.0.0"
}

header = {"content-type": "application/json"}

col_list = ["Rank","Root Domain","Linking Root Domains","Domain Authority"]

df = pd.read_csv("top500Domains.csv", usecols=col_list)

for _ in range(500):
    postBody["domainName"] = df["Root Domain"][randint(0, 499)]
    postBody["listType"] = validListTypes[randint(0,4)]
    postBody["ipAddress"] = ipAdresses[randint(0,4)]
    response = requests.post(URL + proxyID, data=json.dumps(postBody), headers=header)
    print(response.content)
    print(postBody)
