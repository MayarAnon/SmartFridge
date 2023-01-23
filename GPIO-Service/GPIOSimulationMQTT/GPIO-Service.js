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

const loginData = 
{
    host: '127.0.0.1',
    user: 'root',
    password: 'raspberry',
    database: 'smartfridge'
}


const mqtt = require('async-mqtt');
const dataBase = require('./mariaDB') //ZEILE 132 NOCH ÜBERGABEWERTE UND TIME INTERVALL BERÜCKSICHTIGEN

const mqttUrl = "mqtt://localhost";
const mqttTopic1 = "tempInside"; //tempInside 
const mqttTopic2 = "doorState"; //->open/closed

const mqttTopic3 = "alertTimeLimit";//->surpassed/under
const mqttTopic4 = "alertTempLimit";//->surpassed/under
const mqttTopic5 = "timeIntervall"; //->Wie oft gespeichert werden soll in Sekunden
const mqttClient = mqtt.connect(mqttUrl);

const interval = 2000; //Intervall für random Funktion in ms

let timeMessage = "under"; //Als under initialisieren, damit keine Fehlermeldung zum Start kommt.
let tempMessage = "under";
let timeIntervallMessage = null;

const instanceOne = new dataBase(loginData)
const table = 'testen'
const currentID = 8
const currentTempValue = 9

async function nameOfFunctionTwo(tempInside, doorState)
{
    const result = await instanceOne.query(`INSERT INTO ${table} ('ID', 'timeStamp', 'tempValue') VALUES (${currentID}, NOW(), ${currentTempValue});`)
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

//INHALT von "Publish"

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
          if (randomDoorState == "open") 
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
        const doorState = randomState();
        setInterval(() => 
        {
            // Generiert zufällige Temperaturwerte
            const temperature = randomNumber(1, 20).toFixed(1);
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
          //nameOfFunctionTwo()
      }
  });

//INHALT von "subscribe"

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



