
const admin = require('firebase-admin');    

// firebase messaging tokens
const tokens = ["dZp3Ilj6ST-Mqlev3GzSBU:APA91bF7o5FfYRlU_5AvsDVFWGD-1mtoe5IlLtCtkolMgwvw1jzLySnqrycNFRZpiq3WagS1xKS0BhsXbXbGaiWccuoPkO0s243xOyzKX_UEwSOKqOigQexuRKqe2IX4KyuyTx6JK3LE"
]

// initilize the firebase SDK, only run this once
function initializeSecurifyFB() {

    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

// Send the alert
// bool   is_malware: true if domain is detected by the RNN
// string ip_address: IP address of device where the access occured
function sendAlert( is_malware, ip_address ) {

    var message;
    if (is_malware) message = "RNN detected malware access on device: ";
    else            message = "Blacklisted domain access detected on device: "; 

    var message = {
        notification:{
          title: "Securify Alert",
          body:message + ip_address
        },
        tokens:tokens,
    }

    // send to all devices
    admin.messaging().sendMulticast(message)
        .then((response) => {
            console.log("Success",response);
        })
        .catch( (error) => {
            console.log('Error', error);
        });

}

exports.initializeSecurifyFB = initializeSecurifyFB;
exports.sendAlert = sendAlert;