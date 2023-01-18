const express = require('express')
const path = require('path')

//Router erstellen(Miniapplikation)

const cameraRouter = express.Router()

//Pfad zur HTML Seite ermittlen 

const currentDir = __dirname                       // __dirname ist der aktuelle Pfad
const parentDir = path.resolve(currentDir, '..')   //auf den Übergeordneten Ordner wechseln 

//HTML Seite laden 

cameraRouter.get('/',(req,res)=>
{
    res.sendFile(parentDir + '/views/camera.html') 
});

//Modul exportieren 

module.exports = cameraRouter;