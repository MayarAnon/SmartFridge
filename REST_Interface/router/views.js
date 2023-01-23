const express = require('express')
const path = require('path')





class views
{
    constructor()
    {
        if(!views.instance)
        {
            views.instance = this
        }

        //Router erstellen(Miniapplikation)

        this.viewsRouter = express.Router()

        //Pfad zur HTML Seite ermittlen 

        this.currentDir = __dirname;                       // __dirname ist der aktuelle Pfad
        this.parentDir = path.resolve(this.currentDir, '..')   //auf den Übergeordneten Ordner wechseln 

        this.#renderHome()
        this.#renderCamera()
        this.#renderMonitoring()
        this.#renderSettings()

        return this.viewsRouter
    }

    #renderHome()
    {
        //HTML Seite laden 

        this.viewsRouter.get('/Home', (req, res) => 
        {
            res.sendFile(this.parentDir + '/views/home.html')
        })
    }
    #renderCamera()
    {
        this.viewsRouter.get('/camera', (req, res) => 
        {
            res.sendFile(this.parentDir + '/views/camera.html')
        })
    }
    #renderMonitoring()
    {
        this.viewsRouter.get('/Monitoring', (req, res) => 
        {
            res.sendFile(this.parentDir + '/views/monitoring.html')
        })
    }
    #renderSettings()
    {   
        this.viewsRouter.get('/Settings', (req, res) => 
        {
            res.sendFile(this.parentDir + '/views/settings.html')
        })
    }
}

module.exports = views