// const MQTT = require("async-mqtt");
// const alertLog = require("./AlertLog");
// const topic_list={alertTempLimit: "alertTempLimit",
//                 alertTimeLimit: "alertTimeLimit",
//                 deleteHistory: "deleteHistory",
//                 doorState: "doorState",
//                 timeLimitValue: "timeLimitValue",
//                 tempLimitValue: "tempLimitValue",
//                 tempInside: "tempInside"
//                 };
// class Alert{
//     TempLimit = 0.0;
//     TimeLimit = 0;
//     starttime = 0;          //für den Timer für Doorstate
//     timeDiff = 0;           //die Zeit seitdem die Tür geöffnet ist
//     Logger = new alertLog();
//     lastDoorState ="undefined"; //hilfsvariable für den Timer
//     constructor(client){
//         this.client = client;
//     }
    
    
//     setLimits(topic,message){
//         if(topic == "tempLimitValue"){
//             this.TempLimit = message;
//         }
//         if(topic == "timeLimitValue"){
//             this.TimeLimit = message;
//         }
//     }

//     checkTemp(topic,message){
//         if(topic == "tempInside"){
//             if(Math.round(parseFloat(message)) >= Math.round(parseFloat(this.TempLimit))){
//                 //console.log(topic_list.alertTempLimit, "Tempinside= "+this.message+" Schwellwert: "+this.TempLimit + ">>>>> surpassed")
//                 this.client.publish(topic_list.alertTempLimit, "Tempinside= "+message+" Schwellwert: "+this.TempLimit + ">>>>> surpassed");
//                 this.Logger.writeLog("Die Innentemperatur hat den Schwellwert überschritten",topic,message);

//             }else{
//                 //console.log(topic_list.alertTempLimit, "Tempinside= "+this.message+" Schwellwert: "+this.TempLimit+ ">>>>> under ")
//                 this.client.publish(topic_list.alertTempLimit, "Tempinside= "+message+" Schwellwert: "+this.TempLimit+ ">>>>> under ");
//             }
//         }
//     }
//     checkTime(topic,message){
//         if(topic == "doorState"){
//             if(message == "open" & this.lastDoorState!="open"){
//                 this.starttime = Date.now();
//                 this.lastDoorState = "open";
//             }
//             if(message == "closed"){
//                 this.starttime = Date.now();
//             }
//             this.timeDiff = Date.now() - this.starttime;
//             if(this.timeDiff>this.TimeLimit*1000){
//                 this.client.publish(topic_list.alertTimeLimit, "doorstate= "+message+" TimeLimit: "+this.TimeLimit+ " TimeDiff: "+this.timeDiff/1000+ ">>>>> surpassed");
//                 this.Logger.writeLog("Die maximale Öffnungszeit wurde überschritten",topic,message);
//             }else{
//                 this.client.publish(topic_list.alertTimeLimit, "doorstate= "+message+" TimeLimit: "+this.TimeLimit+ " TimeDiff: "+this.timeDiff/1000 +">>>>> under ");
//             }
    
//         }
//     }
    
// }


// module.exports = Alert;





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

class Alert {
  constructor(client) {
    this.TempLimit = 0.0;
    this.TimeLimit = 0;
    this.startTime = 0;
    this.timeDiff = 0;
    this.Logger = new alertLog();
    this.lastDoorState = 'undefined';
    this.client = client;
  }

  setLimits(topic, message) {
    if (topic === 'tempLimitValue') {
      this.TempLimit = message;
    }
    if (topic === 'timeLimitValue') {
      this.TimeLimit = message;
    }
  }

  checkTemp(topic, message) {
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

  checkTime(topic, message) {
    if (topic === 'doorState') {
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
