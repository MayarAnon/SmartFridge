//smartfridge von HaRoMa
//Erstellt einen Express Router welcher alle Post und get request verarbeitet

const express = require("express");
const path = require("path");
const mqtt = require("../../mqttClient/mqttClient");
const emailValidation = require("email-validator");
const dbConnection = new (require("../../DB_Connection/mariaDB"))();

//Verarbeitung aller Post und get requests
//Parameter: keine
//return: instance der RestAPI

class RestAPI {
  constructor() {
    // Sicherstellen das es nur eine Instance gibt der Klasse

    if (!RestAPI.instance) {
      RestAPI.instance = this;
    }

    //Router erstellen(Miniapplikation)

    this.restRouter = express.Router();

    //Zugriff auf HTML Elemente ermöglichen

    this.restRouter.use(express.urlencoded({ extended: false }));

    //Erfassen des Userinputs

    this.restRouter.use(express.json()); // Ermöglicht das Auslesen von JSON-Daten aus dem Request-Body

    this.#distributor();

    return this.restRouter;
  }

  //Verteilt die Endpunkte auf die verschienen Funktionen
  //Parameter: keine
  //return: kein
  async #distributor() {
    this.mqtt = await new mqtt("Restful_Schnittstelle");

    this.restRouter.post("/timeInterval", this.#timeIntervalEndpoint.bind(this)); // Bindet den Wert von "this" auf die aktuelle Instanz des Objekts, um sicherzustellen, dass die Methode "this.timeIntervalEndpoint" innerhalb des Callbacks korrekt aufgerufen wird.
    this.restRouter.post("/deleteHistory",this.#deleteHistoryEndpoint.bind(this));
    this.restRouter.post("/tempLimitValue",this.#tempLimitValueEndpoint.bind(this));
    this.restRouter.post("/timeLimitValue",this.#timeLimitValueEndpoint.bind(this));
    this.restRouter.post("/mailAdressRecipient",this.#mailAdressRecipientEndpoint.bind(this));
    this.restRouter.get("/tempHistory", this.#tempHistroyEndpoint);
    this.restRouter.get("/downloadLog", this.#downloadLogEndpoint);
    this.restRouter.get("/initialValues", this.#initialValuesEndpoint);
  }

  //Endpunt timeInterval, checkt auf eine Valide eingabe und published dann unter dem Topic
  //Prameter: das request und response Objekt
  //return: kein
  async #timeIntervalEndpoint(req, res) {
    try {
      //Erfassen der Nachricht und umwandlung von einem String in eine Zahl

      let logTime = Number(req.body.container);

      //Prüfen der Eingabe ob es sich um eine Zahl handelt oder nicht

      if (isNaN(logTime)) {
        console.log("Keine Zahl!"); //hier eine antwort an den Client einfügen
      } else {
        await this.mqtt.publish("timeInterval", `${logTime}`);
      }
      res.status(200).json({ message: `` });
    } catch (error) {
      res.status(400).json({ message: `${error}` });
    }
  }
  //Endpunt delteHistory, checkt auf eine Valide eingabe und published dann unter dem Topic
  //Prameter: das request und response Objekt
  //return: kein
  async #deleteHistoryEndpoint(req, res) {
    try {
      let answer = req.body.container;

      if (answer === "true") {
        await this.mqtt.publish("deleteHistory", "true");
      } else {
        await this.mqtt.publish("deleteHistory", "false");
      }
      res.status(200).json({ message: `` });
    } catch (error) {
      res.status(400).json({ message: `${error}` });
    }
  }
  //Endpunt delteHistory, checkt auf eine Valide eingabe und published dann unter dem Topic
  //Prameter: das request und response Objekt
  //return: kein
  async #tempLimitValueEndpoint(req, res) {
    try {
      //Erfassen der Nachricht und umwandlung von einem String in eine Zahl und auf eine Nachkommastelle runden

      let tempLimit = Number(req.body.container).toFixed(1);

      //Prüfen der eingabe ob es sich um eine Zahl handelt oder nicht

      if (isNaN(tempLimit)) {
        console.log("Keine Zahl!");
        //hier eine antwort an den Client einfügen
      } else {
        await this.mqtt.publish("tempLimitValue", `${tempLimit}`);
      }
      res.status(200).json({ message: `` });
    } catch (error) {
      res.status(400).json({ message: `${error}` });
    }
  }
  //Endpunt delteHistory, checkt auf eine Valide eingabe und published dann unter dem Topic
  //Prameter: das request und response Objekt
  //return: kein
  async #timeLimitValueEndpoint(req, res) {
    try {
      //Erfassen der Nachricht und umwandlung von einem String in eine Zahl

      let timeLimit = Number(req.body.container);

      //Prüfen der eingabe ob es sich um eine Zahl handelt oder nicht

      if (isNaN(timeLimit)) {
        console.log("Keine Zahl!");
        //hier eine antwort an den Client einfügen
      } else {
        await this.mqtt.publish("timeLimitValue", `${timeLimit}`);
      }
      res.status(200).json({ message: `` });
    } catch (error) {
      res.status(400).json({ message: `${error}` });
    }
  }

  //Endpunt mailAddressRecipient, checkt auf eine Valide eingabe und published dann unter dem Topic
  //Prameter: das request und response Objekt
  //return: kein
  async #mailAdressRecipientEndpoint(req, res) {
    try {
      let mailAdress = req.body.container;
      //Validierung der E-Mail-Adresse
      if (emailValidation.validate(mailAdress)) {
        await this.mqtt.publish("mailAdressRecipient", `${mailAdress}`);
      }
      res.status(200).json({ message: `` });
    } catch (error) {
      res.status(400).json({ message: `${error}` });
    }
  }

  //Endpunt tempHistory, hohlt gesamte daten aus der Datenbank und stellt sie dann unter dem Endpunkt als Objekt zur verfügung
  //Prameter: das request und response Objekt
  //return: kein
  async #tempHistroyEndpoint(req, res) {
    //Array für die Daten aus der Datenbank

    const data = [];

    //SQL Abfrage

    const sqlResult = await dbConnection.query("SELECT * FROM messergebnisse");

    // Ergebniss von Metadaten trennen

    sqlResult.forEach((element) => {
      const tableEntry = {
        ID: element.ID,
        timeStamp: element.timeStamp,
        Value: element.tempValue,
      };

      data.push(tableEntry);
    });
    //Daten aus Datenbank an Endpunkt zur verfügung stellen

    res.send(sqlResult);
  }

  //Endpunt downloadLog, stellt die Log datei als download unter dem Endpuntk zur Verfügung
  //Prameter: das request und response Objekt
  //return: kein
  #downloadLogEndpoint(req, res) {
    const logPath = path.join(__dirname, "../", "public/Log.txt");

    res.download(logPath);
  }

  //Endpunt intitialValues, lädt Werte aus der Config und stellt sie als String Objekt unter dem Endpunkt zur Verfügung
  //Prameter: das request und response Objekt
  //return: kein
  #initialValuesEndpoint(req, res) {
    const config = new (require("../../Configmanager/config"))();
    const dataObjekt = {
      mailAdressRecipient: config.get("mailAdressRecipient"),
      lastDeleteHistory: config.get("lastDeleteHistory"),
      tempLimitValue: config.get("tempLimitValue"),
      timeLimitValue: config.get("timeLimitValue"),
    };
    res.send(JSON.stringify(dataObjekt));
  }
}

module.exports = RestAPI;
