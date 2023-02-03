//smartfridge von HaRoMa
//erstellt den Webserver und ruft mit ihm zudem den Websocket auf
const express = require("express");
const http = require("http");
const webSocket = require("../WS-Interface/WS");
const config = new (require("../Configmanager/config"))();

//Erstellt einen Webserver auf Basis von http
//Erstellen von Websocket Server
class WebServer {
  constructor() {
    //Sicherstellen das es nur eine Instanz gibt

    if (!WebServer.instance) {
      WebServer.instance = this;
    }

    this.app = this.#setupServer();
    this.#setupRouters();

    return WebServer.instance;
  }

  //erstellen Webserver und Websocket-Server
  //Parameter: keine
  //return: applikation als Objekt
  #setupServer() {
    try {
      // Applikation erstellen

      const app = express();

      //festlegen auf welchem Port die Applikation funktionieren soll

      app.listen(config.get("webServerPort"));

      //Server erstellen

      const webServer = http.createServer(app);

      //WebSocket starten

      const socket = webSocket(webServer);
      return app;
    } catch (error) {
      console.log(error + "fehler bei Server Setup");
    }
  }
  //Aufsetzen der Router, umleitung der Request auf die Router
  //Parameter:keine
  //return: kein
  #setupRouters() {
    try {
      const viewsRouter = new (require("./router/views"))();
      const restAPI = new (require("./router/restAPI"))();

      this.app.use("/", viewsRouter);
      this.app.use("/api", restAPI);
      this.app.use(express.static("public")); // für Websocke und Log
    } catch (error) {
      console.log(error + "Fehler bei Router setup");
    }
  }
}

const startWebServer = new WebServer();
