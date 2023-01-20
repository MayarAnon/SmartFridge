const mqttClient = require("./mqttClient");

const client = new mqttClient("Restful_Schnittstelle")

async function hello(){
    await client.publish("relavant","hello")
}

hello()