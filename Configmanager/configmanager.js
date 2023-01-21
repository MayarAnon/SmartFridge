const fs = require('fs');
const nconf = require('nconf');
const mqtt = require('../mqttClient/mqttClient')

class ConfigManager {
  constructor()
  {
    //Sicherstellen das es nur einen Configmanager gibt
    if(!ConfigManager.instance)
    {
        ConfigManager.instance = this
    }
    // Festlegung der Configdatei
    nconf.file({ file: './config.json' })

    //Erstellen eines MQTT-Clients

    this.mqttClient = new mqtt("configmanager")

    //relevanten Topics Abonnieren 

    this.mqttClient.subscribe("email")

    //Reagieren auf relevante Nachrichten

    this.mqttClient.on('message',(topic,message) =>
    {
        //Nachricht in die Config datei Speichern

        this.set(topic,message.toString())
    })

    return ConfigManager.instance
  }
  //Methode um den eine neuen Eintrag zu erstellen oder einen Eintrag zu aktualisieren 
  set(key, value) 
  {
    try{
        nconf.set(key, value)
        this.save()
    }catch(error)
    {
        throw error
    }
    
  }

  
  //Methode um den Wert zu einem Schlüssel zu bekommen
  
  get(key) 
  {
    try{
        return nconf.get(key)
    }catch(error)
    {
        throw error
    }
  }

  
  //Methode um die aktullen Konfigurationen in der Datei zu speichern 
  save() 
  {
    try{
       fs.writeFileSync('./config.json', JSON.stringify(nconf.get(), null, 2))
    }catch(error){
        throw error
    }
  }
}

module.exports = ConfigManager;

const instance = new ConfigManager();
