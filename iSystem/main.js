const MQTT = require("async-mqtt");
require('dotenv').config();

const functions = require("./services");


const topicList = {
  alertTempLimit: 'alertTempLimit',
  alertTimeLimit: 'alertTimeLimit',
  deleteHistory: 'deleteHistory',
  doorState: 'doorState',
  timeLimitValue: 'timeLimitValue',
  tempLimitValue: 'tempLimitValue',
  tempInside: 'tempInside'
};

let client;
process.on('uncaughtException', async (err) => {
  console.error(`Uncaught exception: ${err.message}`);
  await client.end();
});



//asyncmqtt referenz: https://github.com/mqttjs/async-mqtt
async function run() {
  console.log("Starting");
	try {

    client = await MQTT.connectAsync(process.env.BROKER_URL)
    // zu allen topics subscriben

    const topics = Object.values(topicList);
    await client.subscribe(topics);

    //random daten in allen topics publischen
    setInterval(()=>{
      client.publish(topicList.deleteHistory, functions.random(['false','false'])); 
      client.publish(topicList.timeLimitValue, "5");
      client.publish(topicList.tempLimitValue, "18.5");
      const randomTemp = Math.random() * 40;
      client.publish('tempInside',randomTemp.toFixed(1).toString()) 
      client.publish(topicList.doorState, functions.random(['closed', 'open']));  
    },2000);

    await client.on('message', function(topic,message){
      console.log(`${topic} >>>> ${message.toString()}`);
    })
	} catch (e){
		console.log(e.stack);
    await client.end();
		process.exit();
	}
}



run();