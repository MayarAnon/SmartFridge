//smartfridge von HaRoMa
//Datei ermölicht den Zugriff auf die Config Datei

const fs = require("fs");
const nconf = require("nconf");


//Die Klasse es dafür zuständig Einstellungen und Daten aus der Configdatei zu hohlen 

class config {
  constructor() 
  {
    //erzeugen Absoluter Pfad zur Konfigdatei

    this.filePath = __dirname + "/config.json"

    // Festlegung der Configdatei

    nconf.file({ file: this.filePath })

    //Auf relevante MQTT Nachriten hören
  }

  //die Funktion hohlt den Inhalt der Configdatei
  //Paramerter: key kann auch eine Aneinanderreihung sein z.B. configManager:clientId
  //Retrun : value
  get(key) {
    try {
      return nconf.get(key)
    } catch (error) 
    {
      console.log(key + " wurde nicht in der Config gefunden")
      throw error;
    }
  }
}

module.exports = config
