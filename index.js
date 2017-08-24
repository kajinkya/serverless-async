var clientId = document.querySelector('meta[name=google-signin-client_id]').content;
var IDENTITY_POOL_ID = 'us-east-1:cec22800-4afc-4b52-8970-59dffb32da2c';

//I had to pull this from the UI. I'm not sure how to get it with cloudformation
var iotHost = 'a1vg8tn90m1i7s.iot.us-east-1.amazonaws.com';

const awsIot = require('aws-iot-device-sdk');
const AWS = require('AWS-sdk');

/*
I'm bundling everything with browserify because I don't want to figure out 
how to include the aws iot sdk without it.
*/

function generateTemporaryAWSCredentials(tokenResponse) {
    console.log('Attempting to obtain Cognito', tokenResponse);

    AWS.config.region = 'us-east-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID,
        Logins: {
            'accounts.google.com': tokenResponse.id_token
        }
    });

    return new Promise((resolve, reject) => {
        AWS.config.credentials.get(function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(AWS.config.credentials);
            }
        });
    });
}

function createIoTDevice(awsCreds) {
    let device = awsIot.device({
        region: 'us-east-1',
        protocol: 'wss',
        host: iotHost,
        clientId: 'my-client-id',
        accessKeyId: awsCreds.accessKeyId,
        secretKey: awsCreds.secretAccessKey,
        sessionToken: awsCreds.sessionToken
    });
    console.log('created IOT device ', device);
    global.iotDevice = device;
    return device;
}

function onMessage(topic, message) {
    console.log('got message ', topic, message);
}

function setupSubscriptions(iotDevice) {
    iotDevice.on('connect', function(){
        console.log('connected');
        iotDevice.on('message', onMessage);
        let userId = global.googleUser.getBasicProfile().getId();
        let topicName = `/users/${userId}`;
        iotDevice.subscribe(topicName);
        console.log('subscribed to ', topicName);
    });
}

global.onSignIn = function onSignIn(googleUser) {
    global.googleUser = googleUser;
    var profile = googleUser.getBasicProfile();
    console.log('signed into google ', profile);
    generateTemporaryAWSCredentials(googleUser.getAuthResponse())
        .then(logger('creds '))
        .then(createIoTDevice)
        .then(logger('device '))
        .then(setupSubscriptions)
        .catch(function(err) {
            console.error(err);
        });
};

//functio that returns logger functions
function logger(message) {
    return function(value) {
        console.log(message,value);
        return value;
    }
}

