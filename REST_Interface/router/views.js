//smartfridge von HaRoMa
//Erstellt einen Express Router welcher das Front-End hostet

const express = require("express");
const path = require("path");

//Stellt die Webseiten unter den verschienen URL's zur Verfügung
//Parameter: keine
//return: Instance der Klasse
class views {
  constructor() {
    //Sicherstellen, dass nur eine Instance existiert

    if (!views.instance) {
      views.instance = this;
    }

    //Router erstellen(Miniapplikation)

    this.viewsRouter = express.Router();

    //Pfad zur HTML Seite ermittlen

    this.currentDir = __dirname; // __dirname ist der aktuelle Pfad
    this.parentDir = path.join(this.currentDir, "../../", "Frontend HTML"); //auf den Übergeordneten Ordner wechseln
    this.viewsRouter.use(express.static(this.parentDir));
    //this.#renderHome()
    //this.#renderCamera()
    //this.#renderMonitoring()
    //this.#renderSettings()

    return this.viewsRouter;
  }

  //Stellt das html Seite unter der URL zur Verfügung
  #renderHome() {
    //HTML Seite laden

    this.viewsRouter.get("/Home", (req, res) => {
      res.sendFile(this.parentDir + "/views/home.html");
    });
  }
  //Stellt das html Seite unter der URL zur Verfügung
  #renderCamera() {
    this.viewsRouter.get("/camera", (req, res) => {
      res.sendFile(this.parentDir + "/views/camera.html");
    });
  }
  //Stellt das html Seite unter der URL zur Verfügung
  #renderMonitoring() {
    this.viewsRouter.get("/Monitoring", (req, res) => {
      res.sendFile(this.parentDir + "/views/monitoring.html");
    });
  }
  //Stellt das html Seite unter der URL zur Verfügung
  #renderSettings() {
    this.viewsRouter.get("/Settings", (req, res) => {
      res.sendFile(this.parentDir + "/views/settings.html");
    });
  }
}

module.exports = views;
