//Das Alert-Service stellt ein MQTT-Broker dar. Es löst Alarme aus, wenn Schwellwerte überschritten wurden. Außerdem ist das Service für
//das Löschen der Daten aus dem Datenbank und aus dem Log zuständig 

const MQTT = require('../mqttClient/mqttClient');
const Alert= require('./Alert');
const configManager = new (require("../Configmanager/configmanager"))();


const alertLog = require("./AlertLog");


const mqttClient = new MQTT("Alert-Service",configManager.get('mqttClient'));
const topicList = {
    alertTempLimit: "alertTempLimit",
    alertTimeLimit: "alertTimeLimit",
    deleteHistory: "deleteHistory",
    doorState: "doorState",
    timeLimitValue: "timeLimitValue",
    tempLimitValue: "tempLimitValue",
    tempInside: "tempInside"
  };

//asyncmqtt referenz: https://github.com/mqttjs/async-mqtt
async function runAlertService() 
{
    
	try 
    {
        //zu topics subscriben
        const topics = Object.values(topicList);
        await mqttClient.subscribe(topics);
        //db Verbindung erstellen
        const mariaDBconnection = require('../DB_Connection/mariaDB');
        const  DBconnection = new mariaDBconnection();

        const Logger = new alertLog(DBconnection,mqttClient);
        await Logger.deleteLog();

        const thisAlert = new Alert(mqttClient);

        await mqttClient.on('message', async function(topic, message) 
        {
            console.log(`${topic}>>>>>> ${message}`);
            try 
            {
                await thisAlert.setLimits(topic, message.toString());
                await thisAlert.checkTime(topic, message.toString());
                await thisAlert.checkTemp(topic, message.toString());
            }
            catch (e) 
            {
                console.error(`${e.message}`);
            }
        });
        
	} 
    catch (e)
    {
		console.error(`${e.message}`);
        await client.end();
		process.exit();
	}
};


runAlertService();