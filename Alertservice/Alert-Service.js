//Das Alert-Service stellt ein MQTT-Broker dar. Es löst Alarme aus, wenn Schwellwerte überschritten wurden. Außerdem ist das Service für
//das Löschen der Daten aus dem Datenbank und aus dem Log zuständig 

const MQTT = require("async-mqtt");
const Alert= require('./Alert')
const alertLog = require("./AlertLog");
require('dotenv').config({path:__dirname+'/../.env'});
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
    client = await MQTT.connectAsync(process.env.BROKER_URL)
	try 
    {
        const topics = Object.values(topicList);
        await client.subscribe(topics);

        const Logger = new alertLog();
        await Logger.deleteLog(client);
        
        const thisAlert = new Alert(client);

        await client.on('message', async function(topic, message) 
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