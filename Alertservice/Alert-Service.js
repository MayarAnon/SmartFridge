const MQTT = require("async-mqtt");
const Alert= require('./Alert')
const alertLog = require("./AlertLog");
const { unlink } = require('fs/promises');
require('dotenv').config();
const topicList = {
    alertTempLimit: "alertTempLimit",
    alertTimeLimit: "alertTimeLimit",
    deleteHistory: "deleteHistory",
    doorState: "doorState",
    timeLimitValue: "timeLimitValue",
    tempLimitValue: "tempLimitValue",
    tempInside: "tempInside"
  };


let client;
process.on('uncaughtException', async (err) => {
    console.error(`Uncaught exception: ${err.message}`);
    await client.end();
});

//asyncmqtt referenz: https://github.com/mqttjs/async-mqtt
async function run() {
    
    //await client.on('connect', () => {
    //    client.publish('debug/connection', 'Alertservie connected')
    //  })

    client = await MQTT.connectAsync(process.env.BROKER_URL)
	try {
        const topics = Object.values(topicList);
        await client.subscribe(topics);

        let Logger = new alertLog();
        await Logger.deleteLog(client);
        
        let thisAlert = new Alert(client)
        await client.on('message', async function(topic, message) {
            console.log(`${topic}>>>>>> ${message}`);
            try {
                await thisAlert.setLimits(topic, message.toString());
                await thisAlert.checkTime(topic, message.toString());
                await thisAlert.checkTemp(topic, message.toString());
            } catch (e) {
                console.error(`${e.message}`);
            }
            });
        
	} catch (e){
		console.error(`${e.message}`);
        await client.end();
		process.exit();
	}
};


run();