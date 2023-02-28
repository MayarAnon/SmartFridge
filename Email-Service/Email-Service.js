//ToDo: Anderen Mailanbieter als GMX im Dauerlauf testen???, aufräumen, kommentieren, Singleton?
//      Klasse auslagern!






/*Der Email-Service dient dem Versenden von E-Mails an die, vom Benutzer festgelegte, E-Mail-Adresse,
im Falle eines Alarms.

/*Referenz für die Verwendung von Nodemailer: 
https://www.w3schools.com/nodejs/nodejs_email.asp*/

const config = new (require("../Configmanager/config"))();
const MQTT = require("../mqttClient/mqttClient");

/*Die Klasse EmailService beinhaltet die Logik zum Entscheiden,
wann eine Mail versendet werden soll.
Atrribute:
config= wird für den Zugriff auf die 
theme= Legt den Betreff der E-Mail fest
content= Legt den Inhalt der E-Mail fest
variableTime= wird benötigt, damit pro Überschreitung der Öffnungszeit nur eine E-Mail versendet wird
variableTemp= wird benötigt, damit pro Überschreitung der Temperatur nur eine E-Mail versendet wird*/
class EmailService{
  
  constructor(client) {
    this.nodemailer = require("nodemailer");
    this.transporter = null;
    this.theme = null;
    this.content = null;
    this.variableTime = 0;
    this.variableTemp = 0;
    this.mailAdressRecipient = config.get("mailAdressRecipient");
  }

  connectSmtp() {
     this.transporter = this.nodemailer.createTransport({
      host: "mail.gmx.net",
      port: 587,
      tls: {
        ciphers: 'TLSv1.2:TLSv1.1',
        rejectUnauthorized: false,
      },
      debug: true,
      auth: {
        user: config.get("mailSender:sender"),
        pass: config.get("mailSender:mailPassword"),
      },
    });
    console.log("Test");
  }
               
  send(receiver, theme, content) {
    this.connectSmtp();
    //Wohin soll die Mail gehen mit welchem Inhalt:  
    let mailOptions = {
      from: config.get("mailSender:sender"),
      to: receiver,
      subject: theme,
      text: content,
    };

    this.transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    this.transporter = null;
  }


  /*Diese Methode beinhaltet die Logik zur Entscheidung, ob eine Mail versendet werden soll.
  Außerdem werden Inhalt und Betreff festgelegt, entsprechend der Art des Alarms.
  Variablen:
  timeMessage= MQTT-Nachricht, ob die Tür zu lang geöffnet ist
  tempMessage= MQTT-Nachricht, ob die maximale Öffnungszeit der Tür überschritten ist
  variableTime=Hilfsvariable, damit die Mail nach dem Auslösen des Alarms aufgrund der Öffnungszeit 
               der Tür nur einmal versendet wird, bis der Status wieder "under" lautet
  variableTemp=Hilfsvariable, damit die Mail nach dem Auslösen des Alarms aufgrund der Temperatur 
               im Kühlschrank nur einmal versendet wird, bis der Status wieder "under" lautet*/
  sendMailDecision(state, topic) {

    if(topic == "alertTimeLimit"){
      if ( state == "surpassed" && this.variableTime == 0) {
        this.theme = "Alarm: Ihr Kühlschrank ist zu lange geöffnet";
        this.content =
          "Ihre Kühlschranktür ist länger, als die maximal zugelassene Öffnungszeit von " +
          config.get("timeLimitValue") +
          " Sekunden geöffnet. Bitte schließen Sie ihren Kühlschrank umgehend.";
          this.send(this.mailAdressRecipient, this.theme, this.content);
        this.variableTime = 1;
      } else if ( state == "under") {
        this.variableTime = 0;
      }
    }
    else if(topic == "alertTempLimit"){
      if (state == "surpassed" && this.variableTemp == 0) {
        this.theme = "Alarm: Ihr Kühlschrank ist zu warm!";
        this.content =
          "Die Temperatur im Inneren Ihres Kühlschranks hat die eingestellte Höchsttemperatur von " +
          config.get("tempLimitValue") +
          " °C überschritten";
          this.send(this.mailAdressRecipient, this.theme, this.content);
        this.variableTemp = 1;
      } else if (state == "under") {
        this.variableTemp = 0;
      }
    }
  }

  setMailAdress(state, topic){
    if(topic == "mailAdressRecipient"){
      this.mailAdressRecipient = state;
    }
  }
}

let emailServiceObject = new EmailService();

// Die Funktion runAlertService führt das Alert-service als MQTTClient aus
runEmailService = (async function () {
  const mqttClient = await new MQTT("emailService:cliendID");
  try {

    await mqttClient.subscribe('alertTimeLimit');
    await mqttClient.subscribe('alertTempLimit');
    await mqttClient.subscribe('mailAdressRecipient');

    await mqttClient.on('message', async function (topic, message) {
      emailServiceObject.sendMailDecision(message.toString(),topic.toString());
      emailServiceObject.setMailAdress(message.toString(),topic.toString());
    });

  } catch (e) {
    console.error(`${e.message}`);
  }
})();