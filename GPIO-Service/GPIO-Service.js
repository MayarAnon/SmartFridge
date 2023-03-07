/*Die Aufgaben des GPIO-Services:
°Sensordaten auslesen und an MQTT weitergeben
°LED´s aktivieren, wenn ein Wert surpassed ist/deaktivieren wenn under
°Nach timeInterval Daten in Datenbank schreiben */

/*Referenz für node-dht-sensor: https://github.com/momenso/node-dht-sensor
Referenz für onoff: https://www.npmjs.com/package/onoff*/

const MQTT = require("../mqttClient/mqttClient");
const Config = require("../Configmanager/config");
const DataBase = require("../DB_Connection/mariaDB");
const UseGpioPorts = require("./UseGPIOPortsClass");

/*Die Klasse GPIOService beinhaltet die Logik des GPIO-Services.
Parameter: 
config=  Manager der Konfigurationsdatei
Attribute:
gpioPorts= Objekt, zur Nutzung der GPIO-Ports
doorState= Status der Kühlschranktür (open/closed)
tempInside= Gemessene Temperatur im Kühlschrank
timeInterval= Intervall, in dem in die Datenbank geschrieben werden soll*/
class GPIOService {
  constructor(config) {
    this.gpioPorts = new UseGpioPorts(config);
    this.doorState = null;
    this.tempInside = 0;
    this.timeInterval = config.get("timeIntervalDefault") * 1000;
  }

  //In dieser Methode werden die Sensoren ausgelesen
  readSensors() {
    this.tempInside = this.gpioPorts.readTempSensor();
    let doorStateNumeric = this.gpioPorts.readDoorSensor();
    if (doorStateNumeric == 1) {
      this.doorState = "closed";
    } else if (doorStateNumeric == 0) {
      this.doorState = "open";
    } else {
      console.error("Gemessener Öffnungszustand ungültig");
    }
  }

  /*In dieser Klasse wird entschieden, welche LED aktiviert/deaktiviert werden soll
  topic= MQTT Topic, auf dem die Nachricht gesendet wurde
  state= Über MQTT erhaltener Inhalt*/
  activateLeds(topic, state) {
    if (topic == "alertTimeLimit") {
      if (state == "surpassed") {
        this.gpioPorts.ledOnOff("time", "high");
      } else if (state == "under") {
        this.gpioPorts.ledOnOff("time", "low");
      } else {
        console.error(
          "Die MQTT für timeMessage Nachricht wurde nicht korrekt verarbeitet"
        );
      }
    } else if (topic == "alertTempLimit") {
      if (state == "surpassed") {
        this.gpioPorts.ledOnOff("temp", "high");
      } else if (state == "under") {
        this.gpioPorts.ledOnOff("temp", "low");
      } else {
        console.error(
          "Die MQTT für timeMessage Nachricht wurde nicht korrekt verarbeitet"
        );
      }
    }
  }

  /*Das Intervall, das auf MQTT gesendet wird, nach dem in die Datebank geschrieben wird,
  wird in die entsprechende Variable geschrieben
  Parameter:
  topic= MQTT Topic, auf dem die Nachricht gesendet wurde
  interval= Über MQTT erhaltener Inhalt*/
  timeIntervalToVariable(topic, interval) {
    if (topic == "timeInterval") {
      this.timeInterval = interval * 1000;
      clearInterval(intervalId);
      intervalId = setInterval(async () => {
        try {
          await dbConnection.query(`INSERT INTO ${table} (Messwert) VALUES (${gpioServiceObject.tempInside});`);
        } catch (e) {
          console.error(`${e.message}`);
        }
      }, gpioServiceObject.timeInterval);
    }
  }
}

let config = new Config();
let gpioServiceObject = new GPIOService(config);

/*Hier wird der GPIO-Service ausgeführt und dementsprechend über MQTT auf den
entsprechenden Topics zugehört*/
runGPIOService = (async function () {
  let mqttClient = await new MQTT("gpioService:clientId");
  try {
    //zu topics subscriben
    await mqttClient.subscribe("alertTimeLimit");
    await mqttClient.subscribe("alertTempLimit");
    await mqttClient.subscribe("timeInterval");

    await mqttClient.on("message", async function (topic, message) {
      gpioServiceObject.activateLeds(topic.toString(), message.toString());
      gpioServiceObject.timeIntervalToVariable(
        topic.toString(), message.toString());
    });
  } catch (e) {
    console.error(`${e.message}`);
  }

  //Hier werden jede Sekunde die Sensordaten gelesen und über MQTT veröffentlicht
  const readInterval = 1000;
  setInterval(async () => {
    try {
      await gpioServiceObject.readSensors();
      await mqttClient.publish("doorState", gpioServiceObject.doorState.toString());
      await mqttClient.publish("tempInside", gpioServiceObject.tempInside.toString());
    } catch (e) {
      console.error(`${e.message}`);
    }
  }, readInterval);
})();

//Gemessene Temperatur nach festgelegtem Intervall in die Datenbank schreiben
let dbConnection = new DataBase();
const table = "messergebnisse";
let intervalId = setInterval(async () => {
  try {
    await dbConnection.query(
      `INSERT INTO ${table} (Messwert) VALUES (${gpioServiceObject.tempInside});`);
  } catch (e) {
    console.error(`${e.message}`);
  }
}, gpioServiceObject.timeInterval);