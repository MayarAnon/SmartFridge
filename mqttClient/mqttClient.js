const mqtt = require("async-mqtt")
const config = new (require('../Configmanager/config'))()

 //Klasse für die erstellung einer MQTT Verbindung gibt eine MQTT-Client zurück mit allen funktionen von async Mqtt
 //Vorteile: nur eine Instance pro Service, Eine Verbindung, Automatisches Reconnecten, automatische Sicherheit
class mqttClient
{
    constructor(serviceName)
    {
        //Sicherstellen, dass nur eine Verbindung besteht 
        

        //Optionen der Verbindung deklarieren

        this.brokerHostUrl = config.get('mqttClient:brokerHostUrl')
        
        
        this.options =
        {
            clean : true, // Sorgt für den Empfang von Nachrichten QoS 1 und 2 wenn Offline
            reconnectPeriod: 1000, // falls Verbindung abbricht / Verbindungsversuch fehlschlägt => Zeit zwischen Versuchen in ms
            resubscribe : true, 
            clientId: serviceName, 
            username: config.get('mqttClient:username'), //Parameter des Konstruktors
            password: config.get('mqttClient:password')
        }

        

        
        
        return this.#connection()
    }

    async #connection(){
        //Versuch Verbindungsaufbau

        try
        {
            this.client = await mqtt.connectAsync(this.brokerHostUrl,this.options);
        }catch(error)
        {
            console.log(error)
        }
        return this.client
    }

    //Trennt die Verbindung bei Zerstörung des Objekts

    destructor()
    {
        this.client.end()
    }
}




module.exports = mqttClient;




