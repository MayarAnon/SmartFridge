// Die Klasse Alert ist zuständig für das Auslösen der Alarme 
const alertLog = require('./AlertLog');

const topics = {
  alertTempLimit: 'alertTempLimit',
  alertTimeLimit: 'alertTimeLimit',
  deleteHistory: 'deleteHistory',
  doorState: 'doorState',
  timeLimitValue: 'timeLimitValue',
  tempLimitValue: 'tempLimitValue',
  tempInside: 'tempInside'
};
//Die Klasse analysiert die Daten vom MQTT-Broker und löst Alarme aus, falls Limits überschritten wurden
//Der Alert-service-MQTT-Client muss übergeben werden
class Alert 
{
  constructor(client) 
  {
    this.TempLimit = 0.0;
    this.TimeLimit = 0;
    this.startTime = 0;
    this.timeDiff = 0;
    this.Logger = new alertLog();
    this.lastDoorState = 'undefined';
    this.client = client;
  }
  // Die Methode ermittelt die Schwellwert(TempLimit/TimeLimit) aus den MQTT-Nachrichten
  // Topic und Message von MQTT müssen übergeben werden
  setLimits(topic, message) 
  {
    if (topic === 'tempLimitValue') {
      this.TempLimit = message;
    }
    if (topic === 'timeLimitValue') {
      this.TimeLimit = message;
    }
  }
  //Die Methode überprüft, ob der TemperaturSchwellwert überschritten wurde und löst ein Alarm aus/ schreibt einen Rekord im Log
  // Topic und Message von MQTT müssen übergeben werden
  checkTemp(topic, message) 
  {
    if (topic === 'tempInside') {
      const temp = parseFloat(message);
      if (Math.round(temp) >= Math.round(this.TempLimit)) {
        this.client.publish(
          topics.alertTempLimit,
          `Tempinside= ${temp} Schwellwert: ${this.TempLimit}>>>>> surpassed`
        );
        this.Logger.writeLog(
          'Die Innentemperatur hat den Schwellwert überschritten',
          topic,
          message
        );
      } else {
        this.client.publish(
          topics.alertTempLimit,
          `Tempinside= ${temp} Schwellwert: ${this.TempLimit}>>>>> under `
        );
      }
    }
  }
  //Die Methode überprüft, ob der maximalen Öffnungszeit überschritten wurde und löst ein Alarm aus/ schreibt einen Rekord im Log
    // Topic und Message von MQTT müssen übergeben werden
  checkTime(topic, message) 
  {
    if (topic === 'doorState') {
      // Ist der aktuelle Zustand = "open" und die Tür davor "Closed" war, dann wird ein Timer gestart >>> timeDiff=0
      // Ist der aktuelle Zustand = "open" und die Tür davor auch "open" war, dann läuft der Timer weiter >>> timeDiff>0
      // ist der aktuelle Zustand = "closed" wird der Timer rückgesetzt >>> timeDiff=0      
      if (message === 'open' && this.lastDoorState === 'closed') {
        this.startTime = Date.now();
        this.lastDoorState = 'open';
      }
      if (message === 'closed') {
        this.startTime = Date.now();
      }
      this.timeDiff = Date.now() - this.startTime;
      if (this.timeDiff > this.TimeLimit * 1000) {
        this.client.publish(
          topics.alertTimeLimit,
          `doorstate= ${message} TimeLimit: ${this.TimeLimit} TimeDiff: ${
            this.timeDiff / 1000
          }>>>>> surpassed`
        );
        this.Logger.writeLog(
          'Die maximale Öffnungszeit wurde überschritten',
          topic,
          message
        );
      } else {
        this.client.publish(
          topics.alertTimeLimit,
          `doorstate= ${message} TimeLimit: ${this.TimeLimit} TimeDiff: ${
            this.timeDiff / 1000
          }>>>>> under `
        );
      }
    }
  }
}

module.exports = Alert;
