/* weiterzugebende Werte: 
°doorState -> open/closed 
°tempInside->Temperatur im Kühlschrank in Grad Celsius mit einer Nachkommastelle

erhält die Werte: 
°alertTimeLimit -> surpassed/under
°alertTempLimit -> surpassed/under
°timeIntervall -> Wie oft gespeichert werden soll in Sekunden

Aufgaben GPIO-Service:
°Sensordaten auslesen und an MQTT weitergeben ->wie oft?
°LED aktivieren wenn ein Wert surpassed ist/deaktivieren wenn under
°Nach timeIntervall Daten in Datenbank schreiben
*/
/*const loginData = 
{
    host: '127.0.0.1',
    user: 'root',
    password: 'raspberry',
    database: 'smartfridge'
}*/


//const mqtt = require('async-mqtt');
const config = new(require('../../Configmanager/configManager'))();
const dbConnection = new(require('../DB_Connection/mariaDB'))();

const mqttUrl = "mqtt://localhost";
const mqttTopic1 = "tempInside"; //tempInside 
const mqttTopic2 = "doorState"; //->open/closed

const mqttTopic3 = "alertTimeLimit";//->surpassed/under
const mqttTopic4 = "alertTempLimit";//->surpassed/under
const mqttTopic5 = "timeIntervall"; //->Wie oft gespeichert werden soll in Sekunden
//const mqttClient = mqtt.connect(mqttUrl);

const mqttClient = new(require('../../mqttClient/mqttClient'))("Restful_Schnittstelle",config.get('mqttClient'));
const interval = 2000; //Intervall für random Funktion in ms

let timeMessage = "under"; //Als under initialisieren, damit keine Fehlermeldung zum Start kommt.
let tempMessage = "under";
//let timeIntervallMessage = null;

const table = 'messergebnisse'

//Funktion, um in die Datenbank zu schreiben
async function writeInDatabase(tempInside)
{
    const result = await dbConnection.query(`INSERT INTO ${table} (Messwert) VALUES (${tempInside});`)
    console.log(result)
}

function ledsAktivieren(timeMessage, tempMessage) //Die Funktion muss noch an der richtigen Stelle verwendet werden und die Variablen müssen übergeben werden
{
  if(timeMessage == 'surpassed')
  {
    console.log('LED ist aktiv. Die maximale Öffnungszeit wurde überschritten')
  }
  else if(timeMessage == 'under')
  {
    console.log('LED ist nicht mehr aktiv. Die Kühlschranktür wurde geschlossen')
  }
  else
  {
    console.error('Die MQTT für timeMessage Nachricht wurde nicht korrekt verarbeitet')
  }

  if(tempMessage == 'surpassed')
  {
    console.log('LED ist aktiv. Die maximale Temperatur wurde überschritten')
  }
  else if(tempMessage == 'under')
  {
    console.log('LED ist nicht mehr aktiv. Die Temperatur ist wieder geringer als die maximal zugelassene Temperatur')
  }
  else
  {
    console.error('Die MQTT für tempMessage Nachricht wurde nicht korrekt verarbeitet')
  }
};

//Die nächsten 2 Funktionen generieren random Werte
let doorState = "open";
function randomDoor() 
{
    if (doorState == "open") 
    {   
        doorState = "closed";
        console.log("IF AUSGEFÜHRT");
    } 
    else 
    {
        doorState = "open";
        console.log("ELSE AUSGEFÜHRT");
    }

    console.log("randomTemp ausgeführt. Status in Funktion: " + doorState);
}
setInterval(randomDoor, 10000);

let tempInside = null;
let tempInsideRounded = null;

function generateRandomValues(minimum, maximum, tempInterval) 
{
  tempInside = minimum;
  let mathVariable = 1;
  setInterval(() => 
  {
    if (doorState == "open") 
    {
      mathVariable = 60 * Math.random() * (maximum - tempInside) / tempInterval;
    } 
    else if (doorState == "closed") 
    {
      mathVariable = -60 * Math.random() * (tempInside - minimum) / tempInterval;
    }
    tempInside = tempInside + mathVariable;
    tempInsideRounded = tempInside.toFixed(1);
    console.log(tempInsideRounded + doorState);
  }, tempInterval);
}
generateRandomValues(5, 20, 300);




function emitFunction() 
{
  setInterval(() => 
  {
    //const temperature = randomTemp(1, 20).toFixed(1);
    console.log('Temperatur: ' + tempInsideRounded + '°C' + ' Türstatus: ' + doorState);
    mqttClient.publish(mqttTopic1, JSON.stringify(tempInsideRounded)).then();
    mqttClient.publish(mqttTopic2, JSON.stringify(doorState)).then();
    writeInDatabase(tempInsideRounded); //.then(console.log("Datenbank befüllen funktioniert"))
  }, interval);
}
emitFunction(); 


//Abonniert die drei Topics
mqttClientSubscribeToTopic = (topic) => {
    mqttClient.subscribe([mqttTopic3, mqttTopic4, mqttTopic5], {}, (error, granted) => 
    {
      if (granted !== null) 
      {
        console.log("\n Subscription erfolgreich erstellt. Topic = " + topic);
      }
      else 
      {
        console.error("Subscription konnte nicht erstellt werden.");
      }
    });
  };
  
  //Funktion, welche beim erfolgreichen Verbinden mit dem MQTT Server abgearbeitet wird.
  mqttClient.on("connect", async () => 
  {
    console.log("MQTT wurde erfolgreich verbunden. Adresse: " + mqttUrl);
  
    // Abonniere ausgewähltes Thema
    await mqttClient.subscribe(mqttTopic3);
    await mqttClient.subscribe(mqttTopic4);
    await mqttClient.subscribe(mqttTopic5);
  });
  
  let zwischenSpeicher = null; 
  //Funktion, welche bei einer neuen MQTT Nachricht in dem Subscription Topic ausgeführt wird.
  mqttClient.on("message", (topic, message) => {
    zwischenSpeicher = message //.toString().trim().split('"').join("");
    //console.log('Wert erhalten: ', zwischenSpeicher, ' on topic ', topic);
    switch (topic) 
    {
        case 'alertTimeLimit':
            timeMessage = zwischenSpeicher;
            console.log('alertTimeLimit: ' + zwischenSpeicher);
            break;
        case 'alertTempLimit':
            tempMessage = zwischenSpeicher;
            console.log('alertTempLimit: ' + zwischenSpeicher);
            break;
        case 'timeIntervall':
            timeIntervallMessage = zwischenSpeicher;
            console.log('timeIntervall: ' + zwischenSpeicher);
            break;
    }
    ledsAktivieren(timeMessage, tempMessage);
  });