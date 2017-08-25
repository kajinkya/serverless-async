var clientId = document.querySelector('meta[name=google-signin-client_id]').content;
var IDENTITY_POOL_ID = 'us-east-1:cec22800-4afc-4b52-8970-59dffb32da2c';

//I had to pull this from the UI. I'm not sure how to get it with cloudformation
var iotHost = 'a1vg8tn90m1i7s.iot.us-east-1.amazonaws.com';

const awsIot = require('aws-iot-device-sdk');
const AWS = require('AWS-sdk');
AWS.config.region = 'us-east-1';


/*
I'm bundling everything with browserify because I don't want to figure out 
how to include the aws iot sdk without it.
*/

//see https://github.com/aws/aws-iot-device-sdk-js/blob/master/examples/browser/temperature-monitor/index.js
//also see https://github.com/zanon-io/serverless-notifications/blob/master/iot/index.js

function setupIOTDevice(creds) {
    let options = {
        region: 'us-east-1',
        protocol: 'wss',
        accessKeyId: creds.accessKeyId,
        secretKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken,
        port: 443,
        host: 'a1vg8tn90m1i7s.iot.us-east-1.amazonaws.com'
    };
    console.log('setting up IOT with ', options);
    let iotDevice = awsIot.device(options);

    iotDevice.on('connect', function(){
        console.log('connected');
        let userId = global.googleUser.getBasicProfile().getId();
        let topicName = `/users/${userId}`;
        iotDevice.subscribe(topicName);
        console.log('subscribed to ', topicName);
    });
    
    iotDevice.on('message', function(topic, message) {
        console.log('got message ', topic, message);
    });

    iotDevice.on('close', function() {
        console.log('closed');
    });

    global.iotDevice = iotDevice;
}

//this is called by the google auth client
global.onSignIn = function onSignIn(googleUser) {
    global.googleUser = googleUser;
    console.log('signed into google ', googleUser.getBasicProfile());

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID,
        Logins: {
            'accounts.google.com': googleUser.getAuthResponse().id_token
        }
    });

    AWS.config.credentials.get(function (err, data) {
        if (err) {
            console.error('error getting creds', err);
        } else {
            let creds = global.creds = AWS.config.credentials;
            console.log('creds gotten ', creds);
            setupIOTDevice(creds);
        }
    });
};
