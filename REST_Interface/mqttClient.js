const MQTT = require("async-mqtt");

run()

async function run() {
  const client = await MQTT.connectAsync("127.0.0.1:1883")
  client.on("connect",console.log("connected"))

  console.log("Starting");
	try {
		await client.publish("timeIntervall", "It works!");
		// This line doesn't run until the server responds to the publish
		await client.end();
		// This line doesn't run until the client has disconnected without error
		console.log("Done");
	} catch (e){
		// Do something about it!
		console.log(e.stack);
		process.exit();
	}
}