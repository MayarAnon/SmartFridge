const mqtt = require('async-mqtt');
const mqttUrl = "mqtt://localhost";

const mqttTopic1 = "alertTimeLimit";//->surpassed/under
const mqttTopic2 = "alertTempLimit";//->surpassed/under

let timeMessage = null;
let tempMessage = null;
/*Referenz für die Verwendung von Nodemailer: 
https://www.w3schools.com/nodejs/nodejs_email.asp*/

class SendMail
{
  constructor()
  {
    this.nodemailer = require('nodemailer');
    this.transporter = this.nodemailer.createTransport({
      host: 'mail.gmx.net',
      port: 587,
      tls: 
      {
        ciphers:'SSLv3',
        rejectUnauthorized: false
      },
      debug:true,
          auth: 
          {
          user: 'smartfridge@gmx.net',
          pass: 'SmarterKuhlschrank123'
          }
    });
  }

  //Mail versenden mit console-meldungen 
  send(receiver, theme, content) 
  {
    //Wohin soll die Mail gehen mit welchem Inhalt:
    let mailOptions = 
    {
      from: 'smartfridge@gmx.net',
      to: receiver,
      subject: theme,
      text: content
    };

    this.transporter.sendMail(mailOptions, function(error, info)
    {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}

class EmailService extends SendMail
{
    constructor()
    {
        super();
        this.theme = null;
        this.content = null; 

        this.variableTime = null;
        this.variableTemp = null;
    }

    sendMailDecision()
    {
        if (timeMessage == "surpassed" && this.variableTime == 0)
        {
            this.theme = "Alarm: Ihr Kühlschrank ist zu lange geöffnet";
            this.content = "Ihre Kühlschranktür ist länger, als die maximal zugelassene Öffnungszeit geöffnet. Bitte schließen Sie ihren Kühlschrank umgehend."
            this.send("felix.matalik@gmail.com", this.theme, this.content);
            this.variableTime = 1;
        }
        else if (timeMessage == "under")
        {
            this.variableTime = 0;
        }

        if (tempMessage == "surpassed" && this.variableTemp == 0)
        {
            this.theme = "Alarm: Ihr Kühlschrank ist zu warm!"
            this.content = "Die Temperatur im inneren Ihres Kühlschranks hat die eingestellte Höchsttemperatur überschritten";
            this.send("felix.matalik@gmail.com", this.theme, this.content);
            this.variableTemp = 1;
        }
        else if (tempMessage == "under")
        {
            this.variableTemp = 0;
        }
    }
    
}

const SendMailObject = new SendMail();
const emailServiceObject = new EmailService();

//MQTT inspiriert von Stefan Stumpf's Git
const mqttClient = mqtt.connect(mqttUrl);

//Abonniert die zwei Topics
mqttClientSubscribeToTopic = (topic) => 
{
  mqttClient.subscribe([mqttTopic1, mqttTopic2], {}, (error, granted) => 
  {
    if (granted !== null) 
    {
      console.log("Subscription erfolgreich erstellt. Topic = " + topic);
    }
    else 
    {
      console.error("Subscription konnte nicht erstellt werden.");
    }
  });
};

//Funktion, welche beim erfolgreichen Verbinden mit dem MQTT Server abgearbeitet wird.
mqttClient.on("connect", async () => 
{
  console.log('MQTT wurde erfolgreich verbunden. Adresse = ' + mqttUrl);

  // Abonniere ausgewähltes Thema
  await mqttClient.subscribe(mqttTopic1);
  await mqttClient.subscribe(mqttTopic2);
});

let zwischenSpeicher = null; 
//Funktion, welche bei einer neuen MQTT Nachricht in dem Subscription Topic ausgeführt wird.
mqttClient.on("message", (topic, message) => {
  zwischenSpeicher = message.toString().trim().split('"').join("");
  //console.log('Wert erhalten: ', zwischenSpeicher, ' on topic ', topic);
  switch (topic) 
  {
      case 'alertTimeLimit':
          timeMessage = zwischenSpeicher;
          console.log('alertTimeLimit: ' + zwischenSpeicher);
          break;
      case 'alertTempLimit':
          tempMessage = zwischenSpeicher;
          console.log('alertTempLimit: ' + zwischenSpeicher);
          break;
  }
  emailServiceObject.sendMailDecision();
});