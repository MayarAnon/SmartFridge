//Die Klasse AlertLog stellt den Log-Manager dar
const fs = require('fs');
require('dotenv').config({path:__dirname+'/../.env'});
const MariaDB = require("../WS-Interface/MariaDB")

//Die Klasse formattiert die Log-Rekords und schreibt alle Rekords in der Datei Log.txt. Die Klasse ist auch für das Löschen der Daten
//aus der LogDatei und aus der Datenbank 
class AlertLog 
{

  constructor(){}

  //Die Funktion formatiert den Inhalt und fügt eine Zeitstempel zum Inhalt hinzu
  // Übergeben muss man nur den String(Inhalt was im Log geschrieben werden muss)
  formatter(content)
  {
    const timestamp = new Date().toISOString().replace(/T/, '     ').replace(/\..+/, '');
    return `${timestamp}      ${content}\n`;
  }
  // Die Funktion löscht den Inhalt des Logs und die Daten aus der DatenBank, wenn "true" unter dem Topic "deleteHistory" gesendet wird 
  //Die Funktion erhält das Mqtt Client(Alert-Service) als Parameter
  deleteLog(client) 
  {
    client.on('message', (topic, message) => {
      if (topic === 'deleteHistory' && message.toString() === 'true') {
        fs.writeFile(process.env.LOG_PATH, '', (err) => {
          if (err) {
            console.error(err);
          }
        });
        const DB = new MariaDB();
        DB.deleteTable();
      }
    });
  }

  //Die funktion übernimmt das Schreiben des Loges
  //Der Inhalt/Record wird der Funktion als String übergeben 
  writeLog(content) 
  {
    fs.appendFile(process.env.LOG_PATH, this.formatter(content), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}

module.exports = AlertLog;
