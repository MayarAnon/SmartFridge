/*Die Aufgaben des GPIO-Services:
°Sensordaten auslesen und an MQTT weitergeben
°LED´s aktivieren, wenn ein Wert surpassed ist/deaktivieren wenn under
°Nach timeInterval Daten in Datenbank schreiben */

/*Referenz für node-dht-sensor: https://github.com/momenso/node-dht-sensor
Referenz für onoff: https://www.npmjs.com/package/onoff*/

const MQTT = require("../mqttClient/mqttClient");
const Config = require("../Configmanager/config");
const DataBase = require("../DB_Connection/mariaDB");
const sensorLib = require("node-dht-sensor");

class UseGpioPorts {
    constructor(config) {
        this.sensorType = config.get("gpioService:tempSensorType"); // Sensor Typ: DHT11
        this.sensorPin = config.get("gpioService:tempSensorPin"); // Pin-Nummer, an der der Sensor angeschlossen ist

        this.Gpio = require("onoff").Gpio;
        this.reedPin = config.get("gpioService:doorContactPin"); // GPIO-Pin, an den der Reedsensor angeschlossen ist
        this.reedSensor = new this.Gpio(this.reedPin, 'in');

        this.ledPinTemp = config.get("gpioService:tempLedPin"); // GPIO-Pin, an den die erste LED angeschlossen ist
        this.tempLed = new this.Gpio(this.ledPinTemp, 'out');
        this.ledPinTime = config.get("gpioService:timeLedPin"); // GPIO-Pin, an den die zweite LED angeschlossen ist
        this.timeLed = new this.Gpio(this.ledPinTime, 'out');
    }

    //Methode, um mit DHT11 Sensor die Temperatur auszulesen
    readTempSensor() {
      const sensor = sensorLib.read(this.sensorType, this.sensorPin);
      return sensor.temperature.toFixed(1);
    }

    //Muss in setInterval aufgerufen werden mit den anderen (vermutlich alles alle 2s -außer Datenbank mit intervallVar)
    readDoorSensor() {
        let doorState = this.reedSensor.readSync();
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
    }
}


class GPIOService {
    constructor(config) {
      this.gpioPorts = new UseGpioPorts(config);
      this.doorState = null;
      this.tempInside = 0;
      this.timeInterval = config.get("timeIntervalDefault") * 1000;
    }

    readSensors(){
        this.tempInside = this.gpioPorts.readTempSensor();
        let doorStateNumeric = this.gpioPorts.readDoorSensor();
        if (doorStateNumeric == 1){
          this.doorState = "closed";
        }
        else if(doorStateNumeric == 0) {
          this.doorState = "open";
        }
        else{
          console.error("Gemessener Öffnungszustand ungültig");
        }
    }

    activateLeds(topic, state) {
        if (topic == "alertTimeLimit") {
            if (state == "surpassed") { 
                console.log("Zeit-LED ist aktiv. Die maximale Öffnungszeit wurde überschritten");
                this.gpioPorts.ledOnOff("time", "high");
            } 
            else if (state == "under") {
                console.log("Zeit-LED ist nicht aktiv. Die Kühlschranktür ist geschlossen");
                this.gpioPorts.ledOnOff("time", "low");
            } 
            else {
                console.error("Die MQTT für timeMessage Nachricht wurde nicht korrekt verarbeitet");
            }
        } 
        else if (topic == "alertTempLimit") {
            if (state == "surpassed") {
                console.log("Temp-LED ist aktiv. Die maximale Temperatur wurde überschritten");
                this.gpioPorts.ledOnOff("temp", "high");
            } 
            else if (state == "under") {
                console.log("Temp-LED ist nicht aktiv. Die Temperatur ist geringer als die maximal zugelassene Temperatur");
                this.gpioPorts.ledOnOff("temp", "low");
            }
            else {
                console.error("Die MQTT für timeMessage Nachricht wurde nicht korrekt verarbeitet");
            }
        }
    }

    timeIntervalToVariable(topic, interval){
      if (topic == "timeInterval")
      {
        this.timeInterval = interval *1000;
      }  
    }
}

let config = new Config();
let gpioServiceObject = new GPIOService(config);

runGPIOService = (async function () {
  let mqttClient = await new MQTT("gpioService:clientId");
    try {
      //zu topics subscriben
      await mqttClient.subscribe("alertTimeLimit");
      await mqttClient.subscribe("alertTempLimit");
      await mqttClient.subscribe("timeInterval");

      await mqttClient.on("message", async function (topic, message) {
        gpioServiceObject.activateLeds(topic.toString(), message.toString()); 
        gpioServiceObject.timeIntervalToVariable(topic.toString(), message.toString());
        console.log("Topic: " + topic + " Message: " + message);
      });
    } catch (e) {
      console.error(`${e.message}`);
    }

    const readInterval = 1000;
    setInterval(async () => {
    try {
        await gpioServiceObject.readSensors();
        await mqttClient.publish('doorState', gpioServiceObject.doorState.toString()); 
        await mqttClient.publish('tempInsidet', gpioServiceObject.tempInside.toString());
    }catch (e) {
      console.error(`${e.message}`);
    }
  }, readInterval);
  })();

// Intervall für das Auslesen und Veröffentlichen der Sensorwerte



let dbConnection = new DataBase();
const table = "messergebnisse";
setInterval(async () => {
  try {
    await dbConnection.query(`INSERT INTO ${table} (Messwert) VALUES (${gpioServiceObject.tempInside});`);
  }catch (e) {
    console.error(`${e.message}`);
  }
}, gpioServiceObject.timeInterval);