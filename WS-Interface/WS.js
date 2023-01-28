const WebSocket = require("ws");
const dbConn = require("./WSDB");
const config = new (require("../Configmanager/config"))();
const MQTT = require("../mqttClient/mqttClient");
const webServerHost = config.get("webServerHost");
const webSocketPort = config.get("webSocketPort");
const sendIntervallforSystemtime = 1000; // in ms
let sendIntervallforDBData = Number(config.get("timeIntervallDefault")); //in ms

class WS {
  constructor(webServer) {
    if (!WS.instance) {
      WS.instance = this;
    }

    this.topicList = {
      doorState: "doorState",
      timeIntervall: "timeIntervall",
    };

    this.#creatWebsocketServer(webServer);
    return WS.instance;
  }
  // Die Methode  integriert ein Websocket(Port 3001) in dem webServer, welcher als Parameter übergeben werden muss.
  // Wenn das Websocket erfolgreich integriert wurde, werden kommenden Nachrichten über WS ausgegeben
  // Außerdem werden die Aktuelle Temperatur und die Kennzahlen jede Sekunde an alle Clients verschickt
  #creatWebsocketServer(webServer) {
    try {
      this.webSocketServer = new WebSocket.Server({ server: webServer });
      let ws;
      this.webSocketServer.on("connection", (ws) => {
        ws.on("message", (message) => {
          console.log(`Neue Nachricht per Websocket erhalten: '${message}'`);
        });
      });

      this.#sendRealTimeData(ws);
      webServer.listen(3001, () => {
        console.log(
          `WebSocket Server wurde gestartet. Adresse = http://${webServerHost}:${webSocketPort}`
        );
      });
    } catch {
      this.handleError();
    }
  }
  //Die Methode sendet eine Nachricht an alle WS-Clients als JSON-String.
  // Die Nachricht wird als Parameter der Methode übergeben (message:String)
  async sendMessage(topic, message) {
    try {
      this.webSocketServer.clients.forEach((k) => {
        k.send(
          JSON.stringify({
            topic: topic,
            message: message,
          })
        );
      });
    } catch (err) {
      this.handleError(err);
    }
  }
  //Die Methode startInterval gibt einen Timer zurück der mit dem Interval _interval die Daten aus der Datenbank mit this.sendMessage sendet
  //Rückgabe ist die TimerID, die z.B. gebraucht wird um den Timer zu stoppen
  #startInterval(_interval) {
    const dbMethodes = new dbConn();
    // Store the id of the interval so we can clear it later
    return setInterval(async () => {
      const latestRow = await dbMethodes.sendLatestRow();
      const metrics = await dbMethodes.sendMetrics();
      await this.sendMessage("LatestTemp", latestRow);
      await this.sendMessage("Metrics", metrics);
    }, _interval * 1000);
  }
  //Die Methode verbindet sich mit der Datenbank und sendet die letzte Zeile, sowie das Maximum/Minimun und den Mittelwert der Messdaten
  //der letzten 24h über WS. Die Methode verbindet sich außerdem mit dem MQTT Broker und sendet den Öffnungszustand des Kühlschranks über WS
  async #sendRealTimeData() {
    const mqttClient = await new MQTT("WS");

    const topics = Object.values(this.topicList);
    mqttClient.subscribe(topics);

    try {
      var dbRetrievalLoop = this.#startInterval(sendIntervallforDBData);
      mqttClient.on("message", (topic, message) => {
        if (topic == "timeIntervall") {
          sendIntervallforDBData = Number(message.toString());
          //Der Alte Timer stoppen und einen neuen mit dem aktuellen Interval starten
          clearInterval(Number(dbRetrievalLoop));
          dbRetrievalLoop = this.#startInterval(sendIntervallforDBData);
        }

        if (topic == "doorState") {
          this.sendMessage("DoorState", message.toString());
        }
      });

      setInterval(() => {
        this.sendMessage("SystemTime", new Date());
      }, sendIntervallforSystemtime);
    } catch (err) {
      this.handleError(err);
    }
  }
  handleError(err) {
    console.error(err);
  }
}
const wsInstance = (webServer) => {
  const wsInst = new WS(webServer);
  Object.freeze(wsInst);
  return wsInst;
};

module.exports = wsInstance;

//const socket = new WS(webServer);

// latestRow.LatestRow().then((x) => {
//   socket.sendMessageToAllClients(x);
// });
