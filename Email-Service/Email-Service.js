

/*Referenz für die Verwendung von Nodemailer: 
https://www.w3schools.com/nodejs/nodejs_email.asp
MQTT inspiriert von Stefan Stumpf's Git*/

//Diese Klasse ist für das Versenden einer E-Mail mit Nodemailer über GMX
const config = new (require("../Configmanager/config"))();
class sendMail
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
          user: config.get('mailSender:sender'),
          pass: config.get('mailSender:mailPassword')
          }
    });
  }

    //Mit der Methode send wird eine E-Mail versendet 
    send(receiver, theme, content) 
    {
        //Wohin soll die Mail gehen mit welchem Inhalt:
        let mailOptions = 
        {
        from: config.get('mailSender:sender'),
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

/*Die Klasse emailService erbt von der Klasse sendMail und beinhaltet die Logik zum Entscheiden,
wann eine Mail versendet werden soll.
Atrribute:
config= wird für den Zugriff auf die 
theme= Legt den Betreff der E-Mail fest
content= Legt den Inhalt der E-Mail fest
variableTime= wird benötigt, damit pro Überschreitung der Öffnungszeit nur eine E-Mail versendet wird
variableTemp= wird benötigt, damit pro Überschreitung der Temperatur nur eine E-Mail versendet wird*/
class emailService extends sendMail
{
    constructor()
    {
        super();
        this.theme = null;
        this.content = null; 

        this.variableTime = 0;
        this.variableTemp = 0;
    }

    //Diese Methode beinhaltet
    sendMailDecision()
    {
        if (timeMessage == "surpassed" && this.variableTime == 0)
        {
            this.theme = "Alarm: Ihr Kühlschrank ist zu lange geöffnet";
            this.content = "Ihre Kühlschranktür ist länger, als die maximal zugelassene Öffnungszeit von "
            + config.get('alerts:timeLimitValue') + " Sekunden geöffnet. Bitte schließen Sie ihren Kühlschrank umgehend."
            this.send(config.get('mailAdressRecipient'), this.theme, this.content);
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
            + config.get('alerts:tempLimitValue') + " °C überschritten";
            this.send(config.get('mailAdressRecipient'), this.theme, this.content);
            this.variableTemp = 1;
        }
        else if (tempMessage == "under")
        {
            this.variableTemp = 0;
        }
    }
    
}

/*Die Klasse mqttClass ist für das Empfangen der Nachrichten über MQTT
Attribute:
config= ermöglicht die Verwendung der Inhalte aus der config-Datei
mqtt= bindet das package "async-mqtt" ein
mqttUrl= legt die URL des Brokers fest
mqttTopic1= das Topic "alertTimeLimit", über das surpassed/under gesendet wird im Falle eines/keines Alarms
mqttTopic2=das Topic "alertTempLimit", über das surpassed/under gesendet wird im Falle eines/keines Alarms
mqttClient= Definiert die MQTT-Verbindung 
zwischenSpeicher= ist die Variable in die der über MQTT erhaltene Inhalt gespeichert wird, bevor er auf die 
                  Topic-spezifischen Variablen verteilt wird*/
class mqttClass 
{
    constructor()
    {
        this.mqtt = require('async-mqtt');
        this.mqttUrl = "mqtt://localhost";

        this.mqttTopic1 = "alertTimeLimit";//->surpassed/under
        this.mqttTopic2 = "alertTempLimit";//->surpassed/under
        this.mqttClient = this.mqtt.connect(this.mqttUrl);
        this.zwischenSpeicher = null;
    }
    
    //Abonniert die zwei Topics
    mqttClientSubscribeToTopic = async (topic) => 
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
const emailServiceObject = new emailService();
const client = new mqttClass();
client.onConnect();
client.mqttMessage();



 
