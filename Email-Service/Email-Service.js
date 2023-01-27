

/*Referenz für die Verwendung von Nodemailer: 
https://www.w3schools.com/nodejs/nodejs_email.asp
MQTT inspiriert von Stefan Stumpf's Git*/

class SendMail
{
  constructor()
  {
    this.nodemailer = require('nodemailer');
    this.config = new(require('../Configmanager/configmanager'))();
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
          user: this.config.get('mailSender:sender'),
          pass: this.config.get('mailSender:mailPassword')
          }
    });
  }

    //Mail versenden mit console-meldungen 
    send(receiver, theme, content) 
    {
        //Wohin soll die Mail gehen mit welchem Inhalt:
        let mailOptions = 
        {
        from: this.config.get('mailSender:sender'),
        to: receiver,
        subject: theme,
        text: content
        };

        this.transporter.sendMail(mailOptions, function(error, info)
        {
        if (error) 
        {
            console.log(error);
        } 
        else 
        {
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
        this.config = new(require('../Configmanager/configmanager'))();
        this.theme = null;
        this.content = null; 

        this.variableTime = 0;
        this.variableTemp = 0;
    }

    sendMailDecision()
    {
        if (timeMessage == "surpassed" && this.variableTime == 0)
        {
            this.theme = "Alarm: Ihr Kühlschrank ist zu lange geöffnet";
            this.content = "Ihre Kühlschranktür ist länger, als die maximal zugelassene Öffnungszeit von "
            + this.config.get('alerts:timeLimitValue') + " Sekunden geöffnet. Bitte schließen Sie ihren Kühlschrank umgehend."
            this.send(this.config.get('mailAdressRecipient'), this.theme, this.content);
            this.variableTime = 1;
        }
        else if (timeMessage == "under")
        {
            this.variableTime = 0;
        }

        if (tempMessage == "surpassed" && this.variableTemp == 0)
        {
            this.theme = "Alarm: Ihr Kühlschrank ist zu warm!"
            this.content = "Die Temperatur im inneren Ihres Kühlschranks hat die eingestellte Höchsttemperatur von "
            + this.config.get('alerts:tempLimitValue') + " °C überschritten";
            this.send(this.config.get('mailAdressRecipient'), this.theme, this.content);
            this.variableTemp = 1;
        }
        else if (tempMessage == "under")
        {
            this.variableTemp = 0;
        }
    }
    
}

class mqttClass 
{
    constructor()
    {
        this.config = new(require('../Configmanager/configmanager'))();
        this.mqtt = require('async-mqtt');
        this.mqttUrl = "mqtt://localhost";

        this.mqttTopic1 = "alertTimeLimit";//->surpassed/under
        this.mqttTopic2 = "alertTempLimit";//->surpassed/under
        this.mqttClient = this.mqtt.connect(this.mqttUrl);
        this.zwischenSpeicher = null;
    }
    
    //Abonniert die zwei Topics
    mqttClientSubscribeToTopic = (topic) => 
    {
        this.mqttClient.subscribe([this.mqttTopic1, this.mqttTopic2], {}, (error, granted) => 
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
    }
    
    //Funktion, welche beim erfolgreichen Verbinden mit dem MQTT Server abgearbeitet wird.
    onConnect()
    {
        this.mqttClient.on("connect", async () => 
        {
            console.log('MQTT wurde erfolgreich verbunden. Adresse = ' + this.mqttUrl);
            //Ausgewählte Topics abonnieren
            await this.mqttClientSubscribeToTopic();
            
            //await mqttClient.subscribe(mqttTopic1);
            //await mqttClient.subscribe(mqttTopic2);
        });
    }

    //Funktion, welche bei einer neuen MQTT Nachricht in dem Subscription Topic ausgeführt wird.
    mqttMessage()
    {
        this.mqttClient.on("message", (topic, message) => 
        {
            this.zwischenSpeicher = message.toString().trim().split('"').join("");
            //console.log('Wert erhalten: ', zwischenSpeicher, ' on topic ', topic);
            switch (topic) 
            {
                case 'alertTimeLimit':
                    timeMessage = this.zwischenSpeicher;
                    console.log('alertTimeLimit: ' + this.zwischenSpeicher);
                    break;
                case 'alertTempLimit':
                    tempMessage = this.zwischenSpeicher;
                    console.log('alertTempLimit: ' + this.zwischenSpeicher);
                    break;
            }
            emailServiceObject.sendMailDecision();
        });
    }
}


let timeMessage = null;
let tempMessage = null;
const emailServiceObject = new EmailService();
const client = new mqttClass();
client.onConnect();
client.mqttMessage();



 
