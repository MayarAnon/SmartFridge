const sensorLib = require("node-dht-sensor");

/*Die Klasse UseGpioPorts ist für die Ansteuerung der GPIO-Ports.
Parameter:
config=  Manager der Konfigurationsdatei
Attribute:
sensorType = Spezifizierung des DHT Sensors, mit dem die Temperatur gemessen wird
sensorPin = GPIO Pin, an den der DHT11 angeschlossen ist
Gpio = Library für die Verwendung der GPIO-Pins
reedPin = GPIO-Pin, an den der Reedsensor angeschlossen ist
reedSensor = Türsensor
ledPinTemp = GPIO-Pin, an den die LED für den Temperaturalarm angeschlossen ist
tempLed = LED, welche leuchtet, wenn die maximale Temperatur überschritten wurde
ledPinTime = GPIO-Pin, an den die LED für den Öffnungsalarm angeschlossen ist
timeLed = LED, welche leuchtet, wenn die maximale Öffnungszeit überschritten wurde*/
class UseGpioPorts {
  constructor(config) {
    this.sensorType = config.get("gpioService:tempSensorType");
    this.sensorPin = config.get("gpioService:tempSensorPin");

    this.Gpio = require("onoff").Gpio;
    this.reedPin = config.get("gpioService:doorContactPin");
    this.reedSensor = new this.Gpio(this.reedPin, "in");

    this.ledPinTemp = config.get("gpioService:tempLedPin");
    this.tempLed = new this.Gpio(this.ledPinTemp, "out");
    this.ledPinTime = config.get("gpioService:timeLedPin");
    this.timeLed = new this.Gpio(this.ledPinTime, "out");
  }

  //Methode, um mit DHT11 Sensor die Temperatur auszulesen
  readTempSensor() {
    const sensor = sensorLib.read(this.sensorType, this.sensorPin);
    return sensor.temperature.toFixed(1);
  }

  //Methode, welche den Türsensor ausliest und zurückgibt
  readDoorSensor() {
    let doorState = this.reedSensor.readSync();
    return doorState;
  }

  /*Methode, welche die LED´s aktiviert und deaktiviert
  Parameter:
  topic= Thema, zu dem der Alarm gehört (sagt aus, welche LED aktiviert werden soll)
  setHighOrLow= Anweisung, ob die LED aktiviert oder deaktiviert werden soll*/
  ledOnOff(topic, setHighOrLow) {
    if (topic == "time") {
      if (setHighOrLow == "high") {
        this.timeLed.writeSync(1);
      } else if (setHighOrLow == "low") {
        this.timeLed.writeSync(0);
      } else {
        console.log("setHighOrLow: " + setHighOrLow + " ist ungültig");
      }
    } else if (topic == "temp") {
      if (setHighOrLow == "high") {
        this.tempLed.writeSync(1);
      } else if (setHighOrLow == "low") {
        this.tempLed.writeSync(0);
      } else {
        console.log("setHighOrLow: " + setHighOrLow + " ist ungültig");
      }
    }
  }
}

module.exports = UseGpioPorts;
