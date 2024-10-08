const mqtt = require('../mqttClient/mqttClient')
const fs = require('fs');
const nconf = require('nconf');


class configManager
{
    constructor()
    {
        
        //erzeugen Absoluter Pfad zur Konfigdatei 
        
        this.filePath = __dirname + '/config.json'

        // Festlegung der Configdatei

        nconf.file({ file: this.filePath })
        
        //Auf relevante MQTT Nachriten hören 
        
        if(!configManager.instance)
        {
            this.#mqttListener()
            configManager.instance = this
        }
        

        return configManager.this
    }

    get(key) {
        try {
            return nconf.get(key)
        } catch (error) {
            console.log(key + " wurde nicht in der Config gefunden")
            throw error
        }
    }

    //Methode um relevante MQTT Nachrichten zu handeln
    #mqttListener()
    {
        try 
        {
            
            this.mqttClient = new mqtt(this.get('configManager:clientId'),this.get('mqttClient'))

            //relevanten Topics Abonnieren 

            this.mqttClient.subscribe(this.get('configManager:relaventTopics'))

        } catch (error) 
        {
            console.log(error) 
        }

        this.mqttClient.on('message', (topic, message) => 
        {
            //Nachricht in die Config datei Speichern
            //relevaten Topics sind mailAdressRecipient und deleteHistory
            
            //handel deleteHistroy
            
            if(topic == "deleteHistory" && message == "true")
            {
                //Aktuelles Datum hohlen 
                let date = new Date().toLocaleString('de-DE')
                //In Datenbank speichern 
                this.#set("lastDeleteHistory",date)
            }

            if(topic == "mailAdressRecipient")
            {
                this.#set(topic, message.toString())
            }  
        })
    }

    //Methode um den eine neuen Eintrag zu erstellen oder einen Eintrag zu aktualisieren 
    #set(key, value) 
    {
        
        try 
        {
            nconf.set(key, value)
            this.#save()
        } catch (error) 
        {
            throw error
        }
    }

    //Methode um die aktullen Konfigurationen in der Datei zu speichern 
    #save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(nconf.get(), null, 2))
        } catch (error) {
            throw error
        }
    }
    
  
}

module.exports = configManager



const instance = new configManager()
