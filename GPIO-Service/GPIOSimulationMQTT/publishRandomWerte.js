
//Inspiration aus Stephan Stumpfs ET-Tutorial zu MQTT
const mqtt = require('async-mqtt');

const mqttUrl = "mqtt://localhost";
const mqttTopic1 = "tempInside"; //tempInside 
const mqttTopic2 = "doorState";

const mqttClient = mqtt.connect(mqttUrl);

const interval = 2000; //Intervall für random Funktion in ms






//Funktion, welche beim erfolgreichen Verbinden mit dem MQTT Server abgearbeitet wird.
mqttClient.on('connect', async () => {
  console.log(`MQTT wurde erfolgreich verbunden. Adresse = ${mqttUrl}`); 
}, 4000);

//Referenz: https://www.geeksforgeeks.org/how-to-generate-random-number-in-given-range-using-javascript/
function randomNumber(min, max) 
{
    return Math.random() * (max - min) + min;
}

/*let doorState = null;
async function randomDoorState()
{
    doorState = "closed";
    console.log("doorState: " + doorState);
    doorState = "open";  
    return doorState;
}*/
let randomDoorState = "open";
function randomState() 
{
    setInterval(() => 
    {
        if (randomDoorState === "open") 
        {
            randomDoorState = "closed";
        } else 
        {
            randomDoorState = "open";
        }
    }, 10000);
    return randomDoorState;
}


const read = function(callback) 
{
    setInterval(() => 
    {
        // Generiert zufällige Temperaturwerte
        const temperature = randomNumber(1, 20).toFixed(1);
        const doorState = randomState();
        //callback-Funktion aufrufen mit den erzeugten Daten
        callback(null, temperature, doorState);
    }, interval);
}

read(function(err, temperature, doorState) 
{
    if (!err) 
    {
        console.log('Temperature: ' + temperature + '°C');
        mqttClient.publish(mqttTopic1, JSON.stringify(temperature));
        console.log('Türstatus: ' + doorState);
        mqttClient.publish(mqttTopic2, JSON.stringify(doorState));
    }
});