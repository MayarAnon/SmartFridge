//Einbinden der benötigten Bibliotheken 

const express = require('express'); 
const path = require('path'); 

//Router erstellen(Miniapplikation)

const settingsRouter = express.Router();

//Zugriff auf HTML Elemente ermöglichen 

settingsRouter.use(express.urlencoded({extended: false}))

//Pfad zur HTML Seite ermittlen 

const currentDir = __dirname;                       // __dirname ist der aktuelle Pfad
const parentDir = path.resolve(currentDir, '..');   //auf den Übergeordneten Ordner wechseln 

//HTML Seite laden 

settingsRouter.get('/',(req,res)=>{
    
    res.sendFile(parentDir + '/views/settings.html') 
});

//Erfassen des Userinputs

settingsRouter.use(express.json()); // Ermöglicht das Auslesen von JSON-Daten aus dem Request-Body

// Endpunkt zum Erfassen der Speicherzeit intervalls

settingsRouter.post('/timeIntervall',(req,res) => {
    
    //Erfassen der Nachricht und umwandlung von einem String in eine Zahl

    let logtime = Number(req.body.container) 

    //Prüfen der eingabe ob es sich um eine Zahl handelt oder nicht

    if(isNaN(logtime)){
        console.log("Keine Zahl!")
        //hier eine antwort an den Client einfügen 
    }
    else{
        console.log(logtime)
        //hier dann den MQTT Publish befehl einfügen
    }
});

// Endpunkt zum Erfassen ob die gespeicherten Ereignisse gelöscht werden solle

settingsRouter.post('/deleteHistory',(req,res) => {
    let answer = req.body.container

    if(answer === 'true'){
        //Programm welches den Verlauf löscht
    }
});

// Endpunkt zum Erfassen des eingestellten Temperaturlimits

settingsRouter.post('/tempLimitValue',(req,res) => {
    
    //Erfassen der Nachricht und umwandlung von einem String in eine Zahl

    let tempLimit = Number(req.body.container) 

    //Prüfen der eingabe ob es sich um eine Zahl handelt oder nicht

    if(isNaN(tempLimit)){
        console.log("Keine Zahl!")
        //hier eine antwort an den Client einfügen 
    }
    else{
        console.log(tempLimit)
        //hier dann den MQTT Publish befehl einfügen
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
        console.log(timeLimit)
        //hier dann den MQTT Publish befehl einfügen
    }
});

// Endpunkt zum Erfassen der Meldemailadresse 

settingsRouter.post('/mailAdressRecipient',(req,res) => {
    let mailAdress = req.body.container

});

// Endpunkt zum Erfassen ob die Die Log Datei heruntergeladen werden soll

settingsRouter.post('/downloadLog',(req,res) => {
    let answer = req.body.container
    if(answer === 'true'){
        //stell die Datei zum Download bereit 
    }

});

settingsRouter.post('/test', (req, res) => {
    console.log("angekommen" );
    console.log(req.body.container);
    console.log(typeof(req.body.container))
    //hier dann den MQTT Publish befehl einfügen
    
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







/*
settingsRouter.post('/test', (req, res) => {
  console.log("angekommen" );
  console.log(req.body.container);
  console.log(typeof(req.body.container))
  //hier dann den MQTT Publish befehl einfügen
  
});

settingsRouter.post('/intervall', (req, res) => {
    console.log("angekommen" );
    console.log(req.body.container);
    console.log(typeof(req.body.container))
    //hier dann den MQTT Publish befehl einfügen
  });

settingsRouter.post('/temperaturboader', (req, res) => {
    let temperatureLimit = Number(req.body.container)

    //Prüfen der eingabe ob es sich um eine Zahl handelt oder nicht

    if(isNaN(temperatureLimit)){
        console.log("Keine Zahl!")
    }
    else{
        console.log(temperatureLimit)
        //hier dann den MQTT Publish befehl einfügen
    }
});
*/