//Die Klasse AlertLog stellt den Log-Manager dar
const fs = require("fs");
const path = require("path");

const configManager = new (require("../Configmanager/config"))();
const logPath = path.join(__dirname, "../", configManager.get("Log:path"));

//Die Klasse formattiert die Log-Rekords und schreibt alle Rekords in der Datei Log.txt. Die Klasse ist auch für das Löschen der Daten
//aus der LogDatei und aus der Datenbank
//Der Konstruktor bekommt eine Datenbankverbindung und ein MQTTclient als parameter
class AlertLog {
  constructor(dbConnection, client) {
    this.dbConnection = dbConnection;
    this.client = client;
  }

  //Die Funktion formatiert den Inhalt und fügt eine Zeitstempel zum Inhalt hinzu
  // Übergeben muss man nur den String(Inhalt was im Log geschrieben werden muss)
  formatter(content) {
    const time = new Date().toLocaleString("de-DE");
    const timestamp = time;
    return `${timestamp}      ${content}\n`;
  }
  //Mit der Methode lässt sich die Datenbank löschen
  async deleteTable() {
    try {
      const query = "TRUNCATE TABLE messergebnisse";
      this.dbConnection.query(query);
      console.log("Tabelle wurde geleert");
    } catch (err) {
      console.error(err);
    }
  }
  // Die Funktion löscht den Inhalt des Logs und die Daten aus der DatenBank, wenn "true" unter dem Topic "deleteHistory" gesendet wird
  //Die Funktion erhält das Mqtt Client(Alert-Service) als Parameter
  deleteLog() {
    this.client.on("message", (topic, message) => {
      if (topic === "deleteHistory" && message.toString() === "true") {
        fs.writeFile(logPath, "", (err) => {
          if (err) {
            console.error(err);
          }
        });
        this.deleteTable();
      }
    });
  }

  //Die funktion übernimmt das Schreiben des Loges
  //Der Inhalt/Record wird der Funktion als String übergeben
  writeLog(content) {
    fs.appendFile(logPath, this.formatter(content), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}

module.exports = AlertLog;

// const loger = new AlertLog()
// loger.deleteTable()
