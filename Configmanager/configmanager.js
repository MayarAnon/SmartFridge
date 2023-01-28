const mqtt = require('../mqttClient/mqttClient')
const config = require('./config')



class configManager extends config{
    constructor(){
        
        //Konstruktor der ParentKlasse aufrufen 
        
        super()

        //Sicherstellen das es nur eine Instanze von configmanager gibt
        if(!configManager.instance)
        {
            configManager.instance = this
        }

        //Auf relevante MQTT Nachrichten reagiren 

        this.#mqttListener()

        return configManager.instance
    }

    //Methode um relevante MQTT Nachrichten zu handeln
    async #mqttListener()
    {
        try 
        {
            
            this.mqttClient = await new mqtt(this.get('configManager:clientId'))

            //relevanten Topics Abonnieren 

            await this.mqttClient.subscribe(this.get('configManager:relaventTopics'))

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

            if(topic == "timeLimitValue")
            {
                this.#set(topic, message.toString())
            }

            if(topic =="tempLimitValue")
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

const startModule = new configManager()





