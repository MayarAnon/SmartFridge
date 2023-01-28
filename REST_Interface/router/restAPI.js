const config = new(require('../../Configmanager/config'))()
const express = require('express')
const path = require('path')
const mqtt = require('../../mqttClient/mqttClient')
const emailValidation = require('email-validator')
const dbConnection = new(require('../../DB_Connection/mariaDB'))()


class restAPI
{
    constructor(){
         
        if(!restAPI.instance)
        {
            restAPI.instance = this
        }

        //Router erstellen(Miniapplikation)

        this.restRouter = express.Router()

        //Zugriff auf HTML Elemente ermöglichen 

        this.restRouter.use(express.urlencoded({extended: false}))

        //Erfassen des Userinputs

        this.restRouter.use(express.json()); // Ermöglicht das Auslesen von JSON-Daten aus dem Request-Body
        

        this.distributor()
        return this.restRouter
    }

    
    

    async distributor(){
        
        this.mqtt = await new mqtt("Restful_Schnittstelle")
        //maybe später mit Map und for each umsetzen 
        this.restRouter.post('/timeIntervall',this.timeIntervallEndpoint.bind(this))
        this.restRouter.post('/deleteHistory',this.deleteHistoryEndpoint.bind(this))
        this.restRouter.post('/tempLimitValue',this.tempLimitValueEndpoint.bind(this))
        this.restRouter.post('/timeLimitValue',this.timeLimitValueEndpoint.bind(this))
        this.restRouter.post('/mailAdressRecipient',this.mailAdressRecipientEndpoint.bind(this))
        this.restRouter.get('/tempHistory', this.tempHistroyEndpoint)
        this.restRouter.get('/downloadLog',this.downloadLogEndpoint)
    }

    async timeIntervallEndpoint(req , res)
    {
        
        try
        {
            //Erfassen der Nachricht und umwandlung von einem String in eine Zahl
            
            let logTime = Number(req.body.container)

            //Prüfen der Eingabe ob es sich um eine Zahl handelt oder nicht

            if (isNaN(logTime)) {
                console.log("Keine Zahl!") //hier eine antwort an den Client einfügen 
            }
            else {
                
                await this.mqtt.publish("timeIntervall", `${logTime}`)
            }
            res.status(200).json({message :``})

        }catch(error)
        {
            res.status(400).json({message :`${error}`})
        }
        
    }

    async deleteHistoryEndpoint(req , res)
    {
        try
        {
            let answer = req.body.container

            if (answer === 'true') {
                await this.mqtt.publish("deleteHistory", "true")
            } else {
                await this.mqtt.publish("deleteHistory", "false")
            }

            res.status(200).json({message :``})
        }catch(error)
        {
            res.status(400).json({message :`${error}`})
        }
        
    }
    
    async tempLimitValueEndpoint(req,res)
    {
        try
        {
            //Erfassen der Nachricht und umwandlung von einem String in eine Zahl und auf eine Nachkommastelle runden

            let tempLimit = Number(req.body.container).toFixed(1)

            //Prüfen der eingabe ob es sich um eine Zahl handelt oder nicht

            if (isNaN(tempLimit)) {
                console.log("Keine Zahl!")
                //hier eine antwort an den Client einfügen 
            }
            else {
                console.log(tempLimit)
                await this.mqtt.publish("tempLimitValue", `${tempLimit}`)
            }
            res.status(200).json({message :``})
        }catch(error)
        {
            res.status(400).json({message :`${error}`})
        }
        
    }

    async timeLimitValueEndpoint(req,res)
    {
        try
        {
            //Erfassen der Nachricht und umwandlung von einem String in eine Zahl

            let timeLimit = Number(req.body.container)

            //Prüfen der eingabe ob es sich um eine Zahl handelt oder nicht

            if (isNaN(timeLimit)) {
                console.log("Keine Zahl!")
                //hier eine antwort an den Client einfügen 
            }
            else {
                await this.mqtt.publish("timeLimitValue", `${timeLimit}`)
            }
            res.status(200).json({message :``})
        }catch(error)
        {
            res.status(400).json({message :`${error}`})
        }
        
    }

    async mailAdressRecipientEndpoint(req,res)
    {
        try
        {
            let mailAdress = req.body.container
            //Validierung der E-Mail-Adresse
            if (emailValidation.validate(mailAdress)) {
                
                await this.mqtt.publish("mailAdressRecipient", `${mailAdress}`)
        }
            res.status(200).json({message :``})
        }catch(error)
        {
            res.status(400).json({message :`${error}`})
        }
        

    }

    async tempHistroyEndpoint(req,res)
    {
        
        //Array für die Daten aus der Datenbank

        const data = []

        //SQL Abfrage

        const sqlResult = await dbConnection.query('SELECT * FROM messergebnisse')

        // Ergebniss von Metadaten trennen

        sqlResult.forEach(element => {

            const tableEntry =
            {
                ID: element.ID,
                timeStamp: element.timeStamp,
                Value: element.tempValue
            }

            data.push(tableEntry)
        })
        //Daten aus Datenbank an Endpunkt zur verfügung stellen 

        res.send(sqlResult);
    }

    downloadLogEndpoint(req,res)
    {
        
        const logPath = path.join(__dirname,'../../','Log/Log.txt')
        
        
        res.download(logPath)
        
    }



}


module.exports = restAPI