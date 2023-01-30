//smartfridge von HaRoMa
//Datei sorgt für Änderung der Config Datei bei tätigung einer Einstellungen auf der Weboberfläche

const mqtt = require('../mqttClient/mqttClient')
const config = require('./config')
const nconf = require("nconf")
const fs = require("fs")

//ConfigManager ist dafür zuständig Informationen über eine Webbroser Client hinweg zu speichern und zu laden
class configManager extends config
{
    constructor()
    {
        
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
    //Parameter : keine 
    //Return : keine 
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

        // wird aufgerufen bei Nachrichten auf relevanten Topics

        this.mqttClient.on('message', (topic, message) => 
        {
            
            //Verarbeitung der Relevanten Topics
            
            if(topic == "deleteHistory" && message == "true")
            {
                
                let date = new Date().toLocaleString('de-DE') //aktuelles Datum hohlen 

                this.#set("lastDeleteHistory",date) //In Config speichern 
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
    //Parameter: key, value  unter dem key wird der value in der config abgespeichert
    //Return: kein
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

    //Methode um die aktullen Konfigurationen in der config sichert
    //Parameter : keine
    //Return: kein
    #save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(nconf.get(), null, 2)) // null und 2 sind für die Formatierung
        } catch (error) {
            throw error
        }
    }
}

const startModule = new configManager()





