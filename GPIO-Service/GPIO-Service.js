/*Die Aufgaben des GPIO-Services:
°Sensordaten auslesen und an MQTT weitergeben
°LED´s aktivieren, wenn ein Wert surpassed ist/deaktivieren wenn under
°Nach timeInterval Daten in Datenbank schreiben */

/*Referenz für node-dht-sensor: https://github.com/momenso/node-dht-sensor
Referenz für onoff: https://www.npmjs.com/package/onoff*/

const config = new (require("../Configmanager/config"))();
const MQTT = require("../mqttClient/mqttClient");
const dbConnection = new (require("../DB_Connection/mariaDB"))();
const table = "messergebnisse";

class UseGpioPorts {
    constructor() {
        this.sensorLib = require("node-dht-sensor");
        this.sensorType = config.get("gpioService:tempSensorType"); // Sensor Typ: DHT11
        this.sensorPin = config.get("gpioService:tempSensorPin"); // Pin-Nummer, an der der Sensor angeschlossen ist

        this.Gpio = require("onoff").Gpio;
        this.reedPin = config.get("gpioService:doorContactPin"); // GPIO-Pin, an den der Reedsensor angeschlossen ist
        this.reedSensor = new this.Gpio(this.reedPin, 'in');

        this.ledPinTemp = config.get("gpioService:tempLedPin"); // GPIO-Pin, an den die erste LED angeschlossen ist
        this.tempLed = new Gpio(this.ledPinTemp, 'out');
        this.ledPinTime = config.get("gpioService:timeLedPin"); // GPIO-Pin, an den die zweite LED angeschlossen ist
        this.timeLed = new Gpio(this.ledPinTime, 'out');
    }

    //Methode, um mit DHT11 Sensor die Temperatur auszulesen
    readTempSensor() {
        const temperature = null;
        const readout = sensorLib.read(this.sensorType, this.sensorPin);
        temperature = readout.temperature.toFixed(1);
        console.log("gemessene Temperatur: " + temperature);
        return temperature;
    }

    //Muss in setInterval aufgerufen werden mit den anderen (vermutlich alles alle 2s -außer Datenbank mit intervallVar)
    readDoorSensor() {
        const doorState = this.reedSensor.readSync();
        return doorState;
    }

    //
    ledOnOff(topic, setHighOrLow){
        if (topic == "time"){
            if (setHighOrLow == "high"){
                this.timeLed.writeSync(1);
            }
            else if (setHighOrLow == "low"){
                this.timeLed.writeSync(0);
            }
            else{
                console.log("setHighOrLow: " + setHighOrLow + " ist ungültig");
            }
        }

        else if (topic == "temp"){
            if (setHighOrLow == "high"){
                this.tempLed.writeSync(1);
            }
            else if (setHighOrLow == "low"){
                this.tempLed.writeSync(0);
            }
            else{
                console.log("setHighOrLow: " + setHighOrLow + " ist ungültig");
            }
        }

        else{
            console.log("topic: " + topic + " ist ungültig");
        }
    }
}

let gpioPorts = new UseGpioPorts();

class GPIOService {
    constructor() {
      this.doorState = null;
      this.tempInside = null;
      this.timeInterval = config.get("timeIntervalDefault") * 1000;
    }

    readSensors(){
        this.doorState = gpioPorts.readDoorSensor();
        this.tempInside = gpioPorts.readTempSensor();
    }

    activateLeds(state, topic) {
        if (topic == "alertTimeLimit") {
          if (state == "surpassed") {
            console.log("Zeit-LED ist aktiv. Die maximale Öffnungszeit wurde überschritten");
            gpioPorts.ledOnOff("time", "high");
          } else if (state == "under") {
            console.log("Zeit-LED ist nicht aktiv. Die Kühlschranktür ist geschlossen");
            gpioPorts.ledOnOff("time", "low");
          } else {
            console.error("Die MQTT für timeMessage Nachricht wurde nicht korrekt verarbeitet");
          }
        } else if (topic == "alertTempLimit") {
          if (state == "surpassed") {
            console.log("Temp-LED ist aktiv. Die maximale Temperatur wurde überschritten");
            gpioPorts.ledOnOff("temp", "high");
          } else if (state == "under") {
            console.log("Temp-LED ist nicht aktiv. Die Temperatur ist geringer als die maximal zugelassene Temperatur");
            gpioPorts.ledOnOff("temp", "low");
          }
        }
    }

    timeIntervalToVariable(interval, topic){
      if (topic == "timeInterval")
      {
        this.timeInterval = interval;
      }  
    }
}
let gpioServiceObject = new GPIOService();

async function writeInDatabase(tempInside) {
  //console.log("writeInDataBase:" + tempInsideRounded);
  const result = await dbConnection.query(
    `INSERT INTO ${table} (Messwert) VALUES (${tempInside});`
  );
  //console.log(result);
}

//setInterval(Kommentar, 2000);//readSensors, MQTT senden, MQTT hören, activateLeds(state, topic)

// Die Funktion runAlertService führt das Alert-service als MQTTClient aus.
runGPIOService = (async function () {
    const mqttClient = await new MQTT("gpioService:clientId");
    try {
      //zu topics subscriben
      await mqttClient.subscribe("alertTimeLimit");
      await mqttClient.subscribe("alertTempLimit");
      await mqttClient.subscribe("timeInterval");
      //db Verbindung erstellen
      //const mariaDBconnection = require("../DB_Connection/mariaDB");
      //const DBconnection = new mariaDBconnection();
      await mqttClient.on("message", async function (topic, message) {
        gpioObject.activateLeds(message.toString(), topic.toString());
        gpioObject.timeIntervalToVariable(message.toString(), topic.toString());
        console.log("Topic: " + topic + " Message: " + message);
      });
    } catch (e) {
      console.error(`${e.message}`);
    }
  })();

// Intervall für das Auslesen und Veröffentlichen der Sensorwerte
setInterval(async () => {
    await gpioServiceObject.readSensors();
    await client.publish('doorState', this.doorState.toString());
    await client.publish('tempInside', this.tempInside.toString());
  }, 1000);


setInterval(async () => {
  await writeInDatabase(this.tempInside);
}, this.timeInterval);