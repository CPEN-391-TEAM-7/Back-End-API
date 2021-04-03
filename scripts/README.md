## How to use this Script

#### What it's for
This script is a activity generator (as the name suggests) for adding bunch of activities to the backend DB. Since we won't have a lot of activities in there.

`top500Domains.csv` is a csv file that has bunch of domain names and its info. This script will iterate through the column name "Root Domain" and add them to the DB as activites.

#### How to use this script

You need to change `proxyID` variable in the script to your own. To get this, ensure you are registered as one of our user. Then use postman and `GET https://securifyapi.online/user/all`. Find your info and get your proxyID. Replace the `proxyID` variable in the script and run the script.

Ensure you have python installed in your machine and installed all required python packages in `requirements.txt`. You can also run `pip install -r requirements.txt`. (Or `pip3`)To install them. 

Then to run the script: 
```shell
python activity_generator.py (or python3)
```