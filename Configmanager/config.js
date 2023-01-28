const fs = require("fs");
const nconf = require("nconf");

class config {
  constructor() {
    //erzeugen Absoluter Pfad zur Konfigdatei

    this.filePath = __dirname + "/config.json";

    // Festlegung der Configdatei

    nconf.file({ file: this.filePath });

    //Auf relevante MQTT Nachriten hören
  }

  get(key) {
    try {
      return nconf.get(key);
    } catch (error) {
      console.log(key + " wurde nicht in der Config gefunden");
      throw error;
    }
  }
}

module.exports = config;
