//Einbinden der benötigten Bibliotheken 

const express = require('express') 
const path = require('path')
const mqtt = require("async-mqtt")
const emailValidation = require('email-validator')


//Router erstellen(Miniapplikation)

const settingsRouter = express.Router()

//Zugriff auf HTML Elemente ermöglichen 

settingsRouter.use(express.urlencoded({extended: false}))

//Pfad zur HTML Seite ermittlen 

const currentDir = __dirname                        // __dirname ist der aktuelle Pfad
const parentDir = path.resolve(currentDir, '..')    //auf den Übergeordneten Ordner wechseln 

//HTML Seite laden 

settingsRouter.get('/',(req,res)=>
{
    res.sendFile(parentDir + '/views/settings.html') 
});

//Erfassen des Userinputs

settingsRouter.use(express.json()); // Ermöglicht das Auslesen von JSON-Daten aus dem Request-Body

//Funktion für das senden für MQTT Nachrichten 

async function sendMqttMessage(topic,message)
{
    const mqttClient = await mqtt.connectAsync("127.0.0.1:1883")
    console.log("Starting")
    try
    {
        await mqttClient.publish(topic, message)
        await mqttClient.end()

    } catch(error)
    {
        process.exit()
    }
}

// Endpunkt zum Erfassen der Speicherzeit intervalls

settingsRouter.post('/timeIntervall',(req,res) => {
    
    //Erfassen der Nachricht und umwandlung von einem String in eine Zahl

    let logTime = Number(req.body.container) 

    //Prüfen der Eingabe ob es sich um eine Zahl handelt oder nicht

    if(isNaN(logTime))
    {
        console.log("Keine Zahl!") //hier eine antwort an den Client einfügen 
    }
    else{
        sendMqttMessage("timeIntervall",`${logTime}`)
    }
});

// Endpunkt zum Erfassen ob die gespeicherten Ereignisse gelöscht werden solle

settingsRouter.post('/deleteHistory',(req,res) => 
{
    let answer = req.body.container

    if(answer === 'true')
    {
        sendMqttMessage("deleteHistory","true")
    }else
    {
        sendMqttMessage("deleteHistory","false")
    }


});

// Endpunkt zum Erfassen des eingestellten Temperaturlimits

settingsRouter.post('/tempLimitValue',(req,res) => {
    
    //Erfassen der Nachricht und umwandlung von einem String in eine Zahl und auf eine Nachkommastelle runden

    let tempLimit = Number(req.body.container).toFixed(1) 

    //Prüfen der eingabe ob es sich um eine Zahl handelt oder nicht

    if(isNaN(tempLimit)){
        console.log("Keine Zahl!")
        //hier eine antwort an den Client einfügen 
    }
    else{
        console.log(tempLimit)
        sendMqttMessage("tempLimitValue",`${tempLimit}`)
    }
});

// Endpunkt zum Erfassen des eingestellten Zeitlimits

settingsRouter.post('/timeLimitValue',(req,res) => {
    
    //Erfassen der Nachricht und umwandlung von einem String in eine Zahl

    let timeLimit = Number(req.body.container) 

    //Prüfen der eingabe ob es sich um eine Zahl handelt oder nicht

    if(isNaN(timeLimit)){
        console.log("Keine Zahl!")
        //hier eine antwort an den Client einfügen 
    }
    else{
        sendMqttMessage("timeLimitValue",`${timeLimit}`)
    }
});

// Endpunkt zum Erfassen der Meldemailadresse 

settingsRouter.post('/mailAdressRecipient',(req,res) => {
    let mailAdress = req.body.container
    //Validierung der E-Mail-Adresse
    if(emailValidation.validate(mailAdress))
    {
        sendMqttMessage("mailAdressRecipient",`${mailAdress}`)
    }

});


//Modul exportieren 

module.exports = settingsRouter;





/* Sende Daten von der Benutzeroberfläche zum Backend

function transmit(adress,container,value){
          let object ={container , value};
          fetch(adress, {
            method: 'POST',
            body: JSON.stringify(object),
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

Beispiel:
document.getElementById('intervall10s').addEventListener('click',() =>
          transmit('settings/intervall','10s'));
*/

