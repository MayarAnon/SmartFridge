// Die Klasse Alert ist zuständig für das Auslösen der Alarme
const alertLog = require("./AlertLog");
const configManager = new (require("../Configmanager/config"))();
const topics = configManager.get("alertService:relaventTopics");
const timeLimitConfig = configManager.get("timeLimitValue");
const tempLimitConfig = configManager.get("tempLimitValue");
//Die Klasse analysiert die Daten vom MQTT-Broker und löst Alarme aus, falls Limits überschritten wurden
//Der Alert-service-MQTT-Client muss übergeben werden
class Alert {
  constructor(client) {
    this.tempLimit = tempLimitConfig || 0.0;
    this.timeLimit = timeLimitConfig || 0;
    this.startTime = Date.now();
    this.timeDiff = 0;
    this.logger = alertLog();
    this.lastDoorState = "closed";
    this.client = client;
    this.tempAlertLogFlag = false; //hilfsvariablen für den Log
    this.timeAlertLogFlag = false;
  }
  // Die Methode ermittelt die Schwellwert(tempLimit/timeLimit) aus den MQTT-Nachrichten
  // Topic und Message von MQTT müssen übergeben werden
  setLimits(topic, message) {
    if (topic === "tempLimitValue") {
      this.tempLimit = message;
    }
    if (topic === "timeLimitValue") {
      this.timeLimit = message;
    }
  }
  //Die Methode überprüft, ob der TemperaturSchwellwert überschritten wurde und löst ein Alarm aus/ schreibt einen Rekord im Log
  // Topic und Message von MQTT müssen übergeben werden
  checkTemp(topic, message) {
    if (topic === "tempInside") {
      const temp = parseFloat(JSON.parse(message));

      //wenn temp>=templimit dann surpassed publishen
      //und loggen wenn diese Überschreitung noch nicht bereits geloggt wurde
      if (Math.round(temp) >= Math.round(this.tempLimit)) {
        this.client.publish(topics.alertTempLimit, `surpassed`);
        // console.log(`Tempinside= ${temp} Schwellwert: ${this.tempLimit}>>>>> surpassed`)

        //nur bei steigender flanke im log schreiben
        if (this.tempAlertLogFlag == false) {
          this.logger.writeLog(
            "Die Innentemperatur hat den Schwellwert überschritten",
            topic,
            message
          );
          this.tempAlertLogFlag = true;
        }
      } else {
        this.tempAlertLogFlag = false;
        this.client.publish(topics.alertTempLimit, `under`);
        // console.log(`Tempinside= ${temp} Schwellwert: ${this.tempLimit}>>>>> under `)
      }
    }
  }
  //Die Methode überprüft, ob der maximalen Öffnungszeit überschritten wurde und löst ein Alarm aus/ schreibt einen Rekord im Log
  // Topic und Message von MQTT müssen übergeben werden
  checkTime(topic, message) {
    if (topic === "doorState") {
      // Ist der aktuelle Zustand = "open" und die Tür davor "Closed" war, dann wird ein Timer gestart >>> timeDiff=0
      // Ist der aktuelle Zustand = "open" und die Tür davor auch "open" war, dann läuft der Timer weiter >>> timeDiff>0
      // ist der aktuelle Zustand = "closed" wird der Timer rückgesetzt >>> timeDiff=0
      if (message == "open" && this.lastDoorState == "closed") {
        this.startTime = Date.now();
        this.lastDoorState = "open";
      }
      if (message == "closed") {
        this.startTime = Date.now();
        this.timeAlertLogFlag = false;
      }
      this.timeDiff = Date.now() - this.startTime;

      //wenn timeDiff>timelimit dann surpassed publishen
      //und loggen wenn diese Überschreitung noch nicht bereits geloggt wurde
      if (this.timeDiff > this.timeLimit * 1000) {
        this.client.publish(topics.alertTimeLimit, `surpassed`);

        // console.log(`doorstate= ${message} timeLimit: ${this.timeLimit} TimeDiff: ${
        //   this.timeDiff / 1000
        // }>>>>> surpassed`)

        //nur bei steigender Flanke in Log schreiben
        if (this.timeAlertLogFlag == false) {
          this.logger.writeLog(
            "Die maximale Öffnungszeit wurde überschritten",
            topic,
            message
          );
          this.timeAlertLogFlag = true;
        }
      } else {
        this.timeAlertLogFlag = false;
        this.client.publish(topics.alertTimeLimit, `under`);

        // console.log(`doorstate= ${message} timeLimit: ${this.timeLimit} TimeDiff: ${
        //   this.timeDiff / 1000
        // }>>>>> under `)
      }
    }
  }
}

const alertInstance = (client) => {
  const alert = new Alert(client);
  Object.seal(alert);
  return alert;
};
module.exports = alertInstance;
