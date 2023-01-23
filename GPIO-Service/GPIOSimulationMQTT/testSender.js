const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost');

client.on('connect', () => {
  setInterval(() => {
    //const topic1 = "alertTimeLimit";
    const topic2 = "alertTempLimit";
    const message = Math.random() < 0.5 ? 'surpassed' : 'under';
    //client.publish(topic1, message);
    client.publish(topic2, message);
    console.log("Der versendete Inhalt lautet: " + message)
  }, 10000);
});
