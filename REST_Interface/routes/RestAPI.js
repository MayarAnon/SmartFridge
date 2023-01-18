//relevanten Bibliotheken einbinden 

const express = require('express'); 
const dataBase = require('../../DB_Connection/mariaDB')

//Miniapplikation / Router definieren 

const RestAPI = express.Router()

//Anmeldedaten Datenbank

const loginData = 
    {
    host: '127.0.0.1',
    user: 'root',
    password: 'raspberry',
    database: 'smartfridge'
    }

//Objekt für die Datenbank anlegen 

const db = new dataBase(loginData)

//Array für die Daten aus der Datenbank

const data = []

//Endpunkt definieren / wenn aufgerufen wird die asyncrone Funktion aufgerufen

RestAPI.get('/tempHistory', async (req, res) => 
{
    
    //SQL Abfrage
    
    const sqlResult = await db.query('SELECT * FROM testen') 
        
    // Ergebniss von Metadaten trennen

        sqlResult.forEach(element => 
            {
                
                const tableEntry = 
                {
                  ID : element.ID,
                  timeStamp : element.timeStamp,
                  Value : element.tempValue
                }
                
                data.push(tableEntry)
            })
    //Daten aus Datenbank an Endpunkt zur verfügung stellen 
    
    res.send(sqlResult);
    
})

//Endpunkt definieren um den Log herunterzuladen

RestAPI.get('/downloadLog', (req,res) =>
{
    //res.sendFile('../../logFiles/alertLog')
})

 


//Modul exportieren 

module.exports = RestAPI;