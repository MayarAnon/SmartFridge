const express = require('express')
const path = require('path')

//Router erstellen(Miniapplikation)

const homeRouter = express.Router()

//Pfad zur HTML Seite ermittlen 

const currentDir = __dirname;                       // __dirname ist der aktuelle Pfad
const parentDir = path.resolve(currentDir, '..')   //auf den Übergeordneten Ordner wechseln 

//HTML Seite laden 

homeRouter.get('/',(req,res)=>
{   
    res.sendFile(parentDir + '/views/home.html') 
})

//Modul exportieren 

module.exports = homeRouter