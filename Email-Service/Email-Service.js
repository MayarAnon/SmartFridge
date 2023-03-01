/*Der Email-Service dient dem Versenden von E-Mails an die, vom Benutzer festgelegte, E-Mail-Adresse,
im Falle eines Alarms.*/

const config = new (require("../Configmanager/config"))();
const MQTT = require("../mqttClient/mqttClient");
const EmailService = require("./emailService");
let emailServiceObject = new EmailService();

//Die Funktion runEmailService führt den Email-Service aus
runEmailService = (async function () {
  const mqttClient = await new MQTT("emailService:cliendID");
  try {
    await mqttClient.subscribe("alertTimeLimit");
    await mqttClient.subscribe("alertTempLimit");
    await mqttClient.subscribe("mailAdressRecipient");

    await mqttClient.on("message", async function (topic, message) {
      emailServiceObject.sendMailDecision(message.toString(), topic.toString());
      emailServiceObject.setMailAdress(message.toString(), topic.toString());
    });
  } catch (e) {
    console.error(`${e.message}`);
  }
})();
