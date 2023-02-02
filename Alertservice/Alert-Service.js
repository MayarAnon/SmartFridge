//Das Alert-Service stellt ein MQTT-Broker dar. Es löst Alarme aus, wenn Schwellwerte überschritten wurden. Außerdem ist das Service für
//das Löschen der Daten aus dem Datenbank und aus dem Log zuständig

const MQTT = require("../mqttClient/mqttClient");
const alert = require("./Alert");
const configManager = new (require("../Configmanager/config"))();

const alertLog = require("./AlertLog");

//asyncmqtt referenz: https://github.com/mqttjs/async-mqtt

// Die Funktion runAlertService führt das Alert-service als MQTTClient aus.
runAlertService = (async function () {
  const mqttClient = await new MQTT("alertService:clientId");
  try {
    //zu topics subscriben
    const topics = Object.values(
      configManager.get("alertService:relaventTopics")
    );
    await mqttClient.subscribe(topics);
    //db Verbindung erstellen
    const mariaDBconnection = require("../DB_Connection/mariaDB");
    const DBconnection = new mariaDBconnection();
    //Logger erstellen
    const thisLogger = new alertLog(DBconnection, mqttClient);
    await thisLogger.deleteLog();
    //Alert erstellen
    const thisAlert = new alert(mqttClient);
    //auf Nachrichten warten und wenn welche kommen dann mit thisAlert-Methoden verarbeiten
    await mqttClient.on("message", async function (topic, message) {
      try {
        await thisAlert.setLimits(topic, message.toString());
        await thisAlert.checkTime(topic, message.toString());
        await thisAlert.checkTemp(topic, message.toString());
      } catch (e) {
        console.error(`${e.message}`);
      }
    });
  } catch (e) {
    console.error(`${e.message}`);
  }
})();
