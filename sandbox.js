'use strict';

const awsIot = require('aws-iot-device-sdk');
const creds = {
    accessKeyId: "ASIAIEWRS4TMUHIR6AQQ",
    secretAccessKey: "ud5DAY4DMz6rjqRrE4xV45GIiqdkuCvvr2BlSkly",
    sessionToken: "AgoGb3JpZ2luEF4aCXVzLWVhc3QtMSKAAlfLJ8kwqK+OACcJPz…xefXYkEbdJnJLoelJanJLVRElaMZabnZRKSoVATCDiP7MBQ=="
};

let client = awsIot.device({
    region: 'us-east-1',
    protocol: 'wss',
    accessKeyId: creds.accessKeyId,
    secretKey: creds.secretAccessKey,
    sessionToken: creds.sessionToken,
    port: 443,
    host: 'a1vg8tn90m1i7s.iot.us-east-1.amazonaws.com'
});

const onConnect = () => {
    client.subscribe('test-topic');
    console.log('Connected');
};

const onMessage = (topic, message) => {
    console.log('message: ', topic, message);
};

const onError = (err) => {
    console.log('err', err);
};
const onReconnect = () => {
    console.log('reconnect');
};
const onOffline = () => {
    console.log('offline');
};

const onClose = () => {
    console.log('Connection closed');
};

client.on('connect', onConnect);
client.on('message', onMessage);            
client.on('error', onError);
client.on('reconnect', onReconnect);
client.on('offline', onOffline);
client.on('close', onClose);