//smartfridge von HaRoMa
//Erstellt einen Express Router welcher das Front-End hostet

const express = require("express");
const path = require("path");

//Stellt die Webseiten unter den verschienen URL's zur Verfügung
//Parameter: keine
//return: Instance der Klasse
class Views {
  constructor() {
    //Sicherstellen, dass nur eine Instance existiert

    if (!Views.instance) {
      Views.instance = this;
    }

    //Router erstellen(Miniapplikation)

    this.viewsRouter = express.Router();

    //Pfad zur HTML Seite ermittlen

    this.currentDir = __dirname; // __dirname ist der aktuelle Pfad
    this.mainDir = path.join(this.currentDir, "../../", "Frontend HTML"); //auf den Übergeordneten Ordner wechseln
    this.viewsRouter.use(express.static(this.mainDir));

    return this.viewsRouter;
  }
}

module.exports = Views;
