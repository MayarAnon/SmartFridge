const config = new (require("../Configmanager/config"))();
/*Referenz für die Verwendung von Nodemailer: 
https://www.w3schools.com/nodejs/nodejs_email.asp*/

/*Die Klasse EmailService beinhaltet die Logik zum Entscheiden,
wann eine Mail versendet werden soll und den Code zum tatsächlichen Versenden einer Mail
Atrribute:
nodemailer= über "nodemailer" wird das Package nodemailer eingebunden
transporter= Beinhaltet die Daten, um sich auf dem richtigen Mailserver einzuloggen
theme= Legt den Betreff der E-Mail fest
content= Legt den Inhalt der E-Mail fest
variableTime= wird benötigt, damit pro Überschreitung der Öffnungszeit nur eine E-Mail versendet wird
variableTemp= wird benötigt, damit pro Überschreitung der Temperatur nur eine E-Mail versendet wird
mailAdressRecipient= Mailadresse, an die die Mail versendet werden soll*/
class EmailService {
  constructor(client) {
    this.nodemailer = require("nodemailer");
    this.transporter = null;
    this.theme = null;
    this.content = null;
    this.variableTime = 0;
    this.variableTemp = 0;
    this.mailAdressRecipient = config.get("mailAdressRecipient");
  }

  /*Die Methode connectSmtp definiert "this.transporter" mit den nötigen Daten, dass
    der Service sich auf dem Mailserver einloggen kann*/
  connectSmtp() {
    this.transporter = this.nodemailer.createTransport({
      host: "mail.gmx.net",
      port: 587,
      tls: {
        ciphers: "TLSv1.2:TLSv1.1",
        rejectUnauthorized: false,
      },
      debug: true,
      auth: {
        user: config.get("mailSender:sender"),
        pass: config.get("mailSender:mailPassword"),
      },
    });
  }

  /*Die Methode send versendet die E-Mail
    Parameter: 
    receiver= Empfänger der E-Mail
    theme= Überschrift der E-Mail
    content=Inhalt der E-Mail*/
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
    Außerdem werden Inhalt und Betreff festgelegt, entsprechend der Art des Alarms 
    und die Methode "send" wird aufgerufen
    Parameter:
    state = Zustand des Alarms (surpassed/under)
    topic = Name des Topics, auf dem gesendet wurde
    Variablen:
    variableTime=Hilfsvariable, damit die Mail nach dem Auslösen des Alarms aufgrund der Öffnungszeit 
                 der Tür nur einmal versendet wird, bis der Status wieder "under" lautet
    variableTemp=Hilfsvariable, damit die Mail nach dem Auslösen des Alarms aufgrund der Temperatur 
                 im Kühlschrank nur einmal versendet wird, bis der Status wieder "under" lautet*/
  sendMailDecision(state, topic) {
    if (topic == "alertTimeLimit") {
      if (state == "surpassed" && this.variableTime == 0) {
        this.theme = "Alarm: Ihr Kühlschrank ist zu lange geöffnet";
        this.content =
          "Ihre Kühlschranktür ist länger, als die maximal zugelassene Öffnungszeit von " +
          config.get("timeLimitValue") + " Sekunden geöffnet. Bitte schließen Sie ihren Kühlschrank umgehend.";
        this.send(this.mailAdressRecipient, this.theme, this.content);
        this.variableTime = 1;
      } else if (state == "under") {
        this.variableTime = 0;
      }
    } else if (topic == "alertTempLimit") {
      if (state == "surpassed" && this.variableTemp == 0) {
        this.theme = "Alarm: Ihr Kühlschrank ist zu warm!";
        this.content =
          "Die Temperatur im Inneren Ihres Kühlschranks hat die eingestellte Höchsttemperatur von " +
          config.get("tempLimitValue") + " °C überschritten";
        this.send(this.mailAdressRecipient, this.theme, this.content);
        this.variableTemp = 1;
      } else if (state == "under") {
        this.variableTemp = 0;
      }
    }
  }

  /*Die Methode aktualisiert die Mailadresse des Empfängers dementsprechend, was auf der Website eingegeben wird*/
  setMailAdress(state, topic) {
    if (topic == "mailAdressRecipient") {
      this.mailAdressRecipient = state;
    }
  }
}

module.exports = EmailService;