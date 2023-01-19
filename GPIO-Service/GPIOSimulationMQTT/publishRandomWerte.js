//Muss noch random Werte für opened/closed publishen

//Inspiration aus Stephan Stumpfs ET-Tutorial zu MQTT
const mqtt = require('async-mqtt');

const mqttUrl = "mqtt://localhost";
const mqttTopic = "tempInside"; //tempInside 

const mqttClient = mqtt.connect(mqttUrl)

const interval = 2000; // intervall für random Funktion in ms

//Funktion, welche beim erfolgreichen Verbinden mit dem MQTT Server abgearbeitet wird.
mqttClient.on('connect', async () => {
  console.log(`MQTT wurde erfolgreich verbunden. Adresse = ${mqttUrl}`); 
}, 4000);

//Referenz: https://www.geeksforgeeks.org/how-to-generate-random-number-in-given-range-using-javascript/
function randomNumber(min, max) 
{
    return Math.random() * (max - min) + min;
}

const read = function(callback) 
{
    setInterval(() => 
    {
        // Generate random temperature values
        const temperature = randomNumber(1, 20).toFixed(1);
        // Call the callback function with the generated data
        callback(null, temperature);
    }, interval);
}

read(function(err, temperature) 
{
    if (!err) 
    {
        console.log('Temperature: ' + temperature + '°C');
        mqttClient.publish(mqttTopic, JSON.stringify(temperature));
    }
});