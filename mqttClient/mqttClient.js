 "use strict"
 const mqtt = require("async-mqtt")


 //Klasse für die erstellung einer MQTT Verbindung gibt eine MQTT-Client zurück mit allen funktionen von async Mqtt
 //Vorteile: nur eine Instance pro Service, Eine Verbindung, Automatisches Reconnecten, automatische Sicherheit
class mqttClient
{
    constructor(serviceName,loginData)
    {
        //Sicherstellen, dass nur eine Verbindung besteht 
        
        if(!mqttClient.instance)
        {
            mqttClient.instance = this
        }

        //Optionen der Verbindung deklarieren

        this.brokerHostUrl = loginData.brokerHostUrl
        
        this.options =
        {
            clean : true, // Sorgt für den Empfang von Nachrichten QoS 1 und 2 wenn Offline
            reconnectPeriod: 1000, // falls Verbindung abbricht / Verbindungsversuch fehlschlägt => Zeit zwischen Versuchen in ms
            resubscribe : true, 
            clientId: serviceName, 
            username: loginData.username, //Parameter des Konstruktors
            password: loginData.password
        }

        //Versuch Verbindungsaufbau

        try
        {
            this.client = mqtt.connect(this.brokerHostUrl,this.options);
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




