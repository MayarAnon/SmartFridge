/*Die Aufgaben des GPIO-Services:
°Sensordaten auslesen und an MQTT weitergeben
°LED´s aktivieren, wenn ein Wert surpassed ist/deaktivieren wenn under
°Nach timeInterval Daten in Datenbank schreiben */

const config = new (require("../Configmanager/config"))();
const dbConnection = new (require("../DB_Connection/mariaDB"))();
const table = "messergebnisse";
const MQTT = require("async-mqtt");
const mqttUrl = config.get("mqttClient:brokerHostUrl");
const mqttClient = MQTT.connect(mqttUrl);
const mqttTopic1 = "tempInside"; //tempInside
const mqttTopic2 = "doorState"; //->open/closed
const mqttTopic3 = "alertTimeLimit"; //->surpassed/under
const mqttTopic4 = "alertTempLimit"; //->surpassed/under
const mqttTopic5 = "timeInterval"; //->Wie oft in DB speichern (s)

let timeMessage = "under"; //Als under initialisieren, damit keine Fehlermeldung zum Start kommt.
let tempMessage = "under";
let timeIntervalMessage = config.get("timeIntervalDefault") * 1000;

let minimum = 5;
let maximum = 20;
let intervalId;
let saveIntervall = timeIntervalMessage;

/*Diese Klasse hat die Aufgabe die Werte für die Temperatur im Kühlschrank und den Zustand der Türe zu erzeugen.
Außerdem wird hier die Aktivierung der LED´s simuliert durch eine Konsolenausgabe 
Attribute: 
doorState = Zustand der Türe
tempInside = die Temperatur im Kühlschrank
tempInsideRounded = die, auf eine Nachkommastelle, gerundete Temperatur im Kühlschrank*/
class GPIOService {
  constructor() {
    this.doorState = "open";
    this.tempInside = minimum;
    this.tempInsideRounded = minimum;
  }

  /*Die Methode timeActivateLed simuliert eine LED als Konsolenausgabe, abhängig davon ob 
    timeMessage surpassed oder under ist 
    Parameter: timeMessage= MQTT-Nachricht, ob die Tür zu lang geöffnet ist*/
  timeActivateLed(timeMessage) {
    if (timeMessage == "surpassed") {
      console.log(
        "Zeit-LED ist aktiv. Die maximale Öffnungszeit wurde überschritten"
      );
    } else if (timeMessage == "under") {
      console.log(
        "Zeit-LED ist nicht aktiv. Die Kühlschranktür ist geschlossen"
      );
    } else {
      console.error(
        "Die MQTT für timeMessage Nachricht wurde nicht korrekt verarbeitet"
      );
    }
  }

  /*Die Methode timeActivateLed simuliert eine LED als Konsolenausgabe, abhängig davon ob 
    tempMessage surpassed oder under ist
    Parameter: 
    tempMessage= MQTT-Nachricht, ob die maximale Öffnungszeit der Tür überschritten ist*/
  tempActivateLed(tempMessage) {
    if (tempMessage == "surpassed") {
      console.log(
        "Temp-LED ist aktiv. Die maximale Temperatur wurde überschritten"
      );
    } else if (tempMessage == "under") {
      console.log(
        "Temp-LED ist nicht aktiv. Die Temperatur ist geringer als die maximal zugelassene Temperatur"
      );
    } else {
      console.error(
        "Die MQTT für tempMessage Nachricht wurde nicht korrekt verarbeitet"
      );
    }
  }

  //randomDoor wechselt den Zustand von "doorState" von "open" zu "closed" und umgekehrt
  randomDoor() {
    if (this.doorState == "open") {
      this.doorState = "closed";
    } else {
      this.doorState = "open";
    }
    //console.log("randomDoor ausgeführt. Status in Funktion: " + this.doorState);
  }

  /*generateRandomValues erhöht oder verringert den Wert von tempInside abhängig davon,
    ob doorState "open" oder "closed" ist
    Parameter:
    minimum=Definiert die minimale Temperatur, die erzeugt werden soll
    maximum=Definiert die maximale Temperatur, die erzeugt werden soll
    tempInterval=Definiert wie oft ein neuer Wert erzeugt werden soll
    Variable: mathVariable=zufällig erzeugter Wert, um den die Temperatur steigt/fällt*/
  generateRandomValues(minimum, maximum, tempInterval) {
    this.tempInside = minimum;
    let mathVariable = 1;
    setInterval(() => {
      if (this.doorState == "open") {
        mathVariable =
          (100 * Math.random() * (maximum - this.tempInside)) / tempInterval;
      } else if (this.doorState == "closed") {
        mathVariable =
          (-100 * Math.random() * (this.tempInside - minimum)) / tempInterval;
      }
      this.tempInside = this.tempInside + mathVariable;
      this.tempInsideRounded = this.tempInside.toFixed(1);
      //console.log(this.tempInsideRounded + this.doorState);
    }, tempInterval);
  }
}

/*Funktion, um in die Datenbank zu schreiben
Parameter: tempInsideRounded= Auf eine Nachkommastelle gerundeter aktueller Temperaturwert*/
async function writeInDatabase(tempInsideRounded) {
  //console.log("writeInDataBase:" + tempInsideRounded);
  const result = await dbConnection.query(
    `INSERT INTO ${table} (Messwert) VALUES (${tempInsideRounded});`
  );
  //console.log(result);
}

/*emitFunction gibt die erzeugten Werte aus an MQTT und schreibt die aktuelle Temperatur in die Datenbank
Parameter:
tempInsideRounded= Auf eine Nachkommastelle gerundeter aktueller Temperaturwert
doorState= aktueller Status der Türe ->open/closed*/
function emitFunction(tempInsideRounded, doorState) {
  //console.log('emitFunction: Temperatur: ' + tempInsideRounded + '°C ' + ' Türstatus: ' + doorState);
  mqttClient.publish(mqttTopic1, tempInsideRounded.toString()).then();
  mqttClient.publish(mqttTopic2, doorState.toString()).then();
  writeInDatabase(GPIO.tempInsideRounded); //.then(console.log("Datenbank befüllen funktioniert"))
  intervalId = setTimeout(() => {
    emitFunction(GPIO.tempInsideRounded, GPIO.doorState);
  }, saveIntervall);
}

//Ab hier beginnt der Ablauf des Codes:

const GPIO = new GPIOService();

setInterval(() => {
  GPIO.randomDoor();
}, 10000);
GPIO.generateRandomValues(minimum, maximum, 500);
emitFunction(GPIO.tempInsideRounded, GPIO.doorState);

//Abonniert die drei Topics
mqttClientSubscribeToTopic = (topic) => {
  mqttClient.subscribe(
    [mqttTopic3, mqttTopic4, mqttTopic5],
    {},
    (error, granted) => {
      if (granted !== null) {
        //console.log("\n Subscription erfolgreich erstellt. Topic = " + topic);
      } else {
        console.error("Subscription konnte nicht erstellt werden.");
      }
    }
  );
};

//Funktion, welche beim erfolgreichen Verbinden mit dem MQTT Server abgearbeitet wird.
mqttClient.on("connect", async () => {
  try {
    //console.log("MQTT wurde erfolgreich verbunden. Adresse: " + mqttUrl);
    // Abonniere ausgewähltes Thema
    await mqttClient.subscribe(mqttTopic3);
    await mqttClient.subscribe(mqttTopic4);
    await mqttClient.subscribe(mqttTopic5);
  } catch (err) {
    console.error(err);
  }
});

/*In die Variable bufferVar wird der Inhalt, der über MQTT kommt immer geschrieben, 
bevor er auf die, dem Topic entsprechenden, Variablen umverteilt wird */
let bufferVar = null;
//Funktion, welche bei einer neuen MQTT Nachricht in dem Subscription Topic ausgeführt wird.
//Hier wird der Inhalt, der über MQTT auf den drei Topics kommt auch auf drei verschiedene Variablen aufgeteilt
mqttClient.on("message", (topic, message) => {
  try {
    bufferVar = message.toString(); //.trim().split('"').join("");
    //console.log('Wert erhalten: ', bufferVar, ' on topic ', topic);
    switch (topic) {
      case "alertTimeLimit":
        timeMessage = bufferVar;
        GPIO.timeActivateLed(timeMessage);
        break;
      case "alertTempLimit":
        tempMessage = bufferVar;
        GPIO.tempActivateLed(tempMessage);
        break;
      case "timeInterval":
        timeIntervalMessage = bufferVar;
        saveIntervall = timeIntervalMessage * 1000;
        clearTimeout(intervalId);
        emitFunction(GPIO.tempInsideRounded, GPIO.doorState);
        break;
    }
  } catch (err) {
    console.error(err);
  }
});
