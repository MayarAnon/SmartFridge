//  Smartfridge von HaRoMa
//Sendet den Aktuellen Zustand des Systems in die Cloud

const https = require('https');
const mqtt = require('../mqttClient/mqttClient')
const config = new(require('../Configmanager/config'))()

//Diese Klasse sorgt dafür, das der aktuellen Status des Systems in die Cloud übertragen wird
//Parameter: keine 
class CloudService
{
    constructor()
    {
        this.#endpointMessages()
    }

    //macht eine get Request auf die API der Cloud und sendet somit den aktuellen Status
    //Parameter: keine
    //return: kein
    #sendToCloud(topic, message)
    {
        //Unterscheidung in die verschiedenen Topics
        let endpoint = "";
        if(topic =="tempInside")
        {
            endpoint = config.get("cloudservice:tempInside")+message.toString()
        }else if(topic == "tempOutside")
        {
            endpoint = config.get("cloudservice:tempOutside")+message.toString()
        }else if(topic == "doorState")
        {
            let value
            if(message == "open")
            {
                value = 1
            }else
            {
                value = 0
            }
            endpoint = config.get("cloudservice:doorState") + value.toString()
        }
        const options = 
        {
            hostname: config.get("cloudservice:hostname"),
            path: endpoint,
            method: 'GET'
        }
          
          const req = https.request(options, res => 
            {
            console.log(`statusCode: ${res.statusCode}`)
          
          });
          
          req.on('error', error => 
          {
            console.error(error);
          });
          
          req.end()
    }
    //leitet relevante Nachrichten an die sendToCloud methode
    //parameter: keine
    //return: kein 
    async #endpointMessages()
    {
        const mqttClient = await new mqtt('cloudservice')

        await mqttClient.subscribe(['tempInside','tempOutside','doorState'])

        mqttClient.on('message',(topic,message) =>
        {
        
        this.#sendToCloud(topic,message)
    })
    }

}


const instance = new CloudService()