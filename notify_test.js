
/* IMPORTANT

1. ensure "securify-android-1613451047982-firebase-adminsdk-k7t6n-d31bb3e1de.json" is in the same directory 
2. run the following command

export GOOGLE_APPLICATION_CREDENTIALS="securify-android-1613451047982-firebase-adminsdk-k7t6n-d31bb3e1de.json"

*/

const notify = require("./notify");

notify.initializeSecurifyFB();

notify.sendAlert(true,"192.168.1.1");