//Die Klasse AlertLog stellt den Log-Manager dar
const fs = require('fs');
const db = require("../WS-Interface/WSDB");

//const configManager = new (require("../Configmanager/configmanager"))();
const logPath = "../Log/Log.txt"//configManager.get('Log:path')

//Die Klasse formattiert die Log-Rekords und schreibt alle Rekords in der Datei Log.txt. Die Klasse ist auch für das Löschen der Daten
//aus der LogDatei und aus der Datenbank 
class AlertLog 
{

  constructor(){}

  //Die Funktion formatiert den Inhalt und fügt eine Zeitstempel zum Inhalt hinzu
  // Übergeben muss man nur den String(Inhalt was im Log geschrieben werden muss)
  formatter(content)
  {
    const time = new Date().toLocaleString('de-DE');
    const timestamp= time
    return `${timestamp}      ${content}\n`;
  }
  // Die Funktion löscht den Inhalt des Logs und die Daten aus der DatenBank, wenn "true" unter dem Topic "deleteHistory" gesendet wird 
  //Die Funktion erhält das Mqtt Client(Alert-Service) als Parameter
  deleteLog(client) 
  {
    client.on('message', (topic, message) => {
      if (topic === 'deleteHistory' && message.toString() === 'true') {
        fs.writeFile(logPath, '', (err) => {
          if (err) {
            console.error(err);
          }
        });
      //   const dbConnection = new db()
      //   dbConnection.deleteTable();
      }
    });
  }

  //Die funktion übernimmt das Schreiben des Loges
  //Der Inhalt/Record wird der Funktion als String übergeben 
  writeLog(content) 
  {
    fs.appendFile(logPath, this.formatter(content), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}

module.exports = AlertLog;
