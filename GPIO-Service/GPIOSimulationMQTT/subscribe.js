//"use strict"
//Kopiert von Stefan Stumpf's Git

const mqtt = require('async-mqtt');

const mqttUrl = "mqtt://localhost";

const mqttTopic3 = "alertTimeLimit";//->surpassed/under
const mqttTopic4 = "alertTempLimit";//->surpassed/under
const mqttTopic5 = "timeIntervall"; //->Wie oft gespeichert werden soll in Sekunden
const mqttClient = mqtt.connect(mqttUrl);

let timeMessage = "under"; //Als under initialisieren, damit keine Fehlermeldung zum Start kommt.
let tempMessage = "under";
let timeIntervallMessage = null;

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



