
var admin = require('firebase-admin');
//var serviceAccount = require("securify-android-1613451047982-firebase-adminsdk-k7t6n-d31bb3e1de.json");
var topic = "alert"

admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });




var message = {
    "notification":{
      "title":"Test message from node",
      "body":"Alert"
    },
    "topic":topic,
}

admin.messaging().send(message)
    .then((response) => {
        console.log("Success",response);
    })
    .catch( (error) => {
        console.log('Error', error);
    });