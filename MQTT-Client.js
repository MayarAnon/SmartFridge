const MQTT = require("async-mqtt");
require('dotenv').config();

const topicList = {
    deleteHistory: "deleteHistory",
    tempInside: "tempInside"
  };


let client;
process.on('uncaughtException', async (err) => {
    console.error(`Uncaught exception: ${err.message}`);
    await client.end();
});

//asyncmqtt referenz: https://github.com/mqttjs/async-mqtt
async function run() {

    client = await MQTT.connectAsync(process.env.BROKER_URL)
	try {
        const topics = Object.values(topicList);
        await client.subscribe(topics);
        
        await client.on('message', async function(topic, message) {
            console.log(`${topic}>>>>>> ${message}`);
            try {
                await thisAlert.setLimits(topic, message.toString());
                client.publish(topics.tempInside,`${message} >>>>> Beispiel `);
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