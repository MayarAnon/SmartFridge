
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();    // über dem Webserver soll eine exüress webanwendung laufen
const webServer = http.createServer(app);   //webserver bauen
const webSocketServer = new WebSocket.Server({ server: webServer });  //WebsocketServer mit dem bestehenden webserver integrieren

app.use(express.static("html"));

const messages = []; // message



app.get('/',(req,res)=>{
  res.send(messages)
})

webSocketServer.on("connection", (ws) => {      //ws ist der Socket der die Verbindung zu den ws Clients darstellt
  /**
   * Funktion, welche bei einer Nachricht ausgeführt werden soll
   */
  
  ws.on("message", (message) => {
    console.log(`Neue Nachricht per Websocket erhalten: '${message}'`);
    messages.push(message.toString());
    
  })

  // Verbindung wurde erfolgreich hergestellt. Client Feedback senden.
});

app.listen(3000, () => {
  console.log("Server gestartet. http://localhost:3000");
});

webServer.listen(3001, () => {
  console.log(
    `WebSocket Server wurde gestartet. Adresse = http://localhost:3001`
  );
});







