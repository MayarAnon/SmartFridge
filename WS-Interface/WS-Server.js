
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();    // über dem Webserver soll eine exüress webanwendung laufen
const webServer = http.createServer(app);   //webserver bauen
const messages = []; 
app.use(express.static("html"));

 app.get("/", (req, res) => {
   res.send();
});

app.listen(3000, () => {
  console.log("Server gestartet. http://localhost:3000");
});


const MariaDB = require("./MariaDB");

class WS {
    constructor(webServer) {
        this.messages =[];
        this.webSocketServer = new WebSocket.Server({ server: webServer });  //WebsocketServer mit dem bestehenden webserver integrieren
        this.webSocketServer.on("connection", (ws) => {      //ws ist der Socket der die Verbindung zu den ws Clients darstellt
            /**
             * Funktion, welche bei einer Nachricht ausgeführt werden soll
             */
            ws.on("message", (message) => {
                console.log(`Neue Nachricht per Websocket erhalten: '${message}'`);
                //this.sendMessageToAllClients(message);
            })
            //this.sendMessageToAllClients("halllllllllllllo");
            
            this.lastRow();
            // Verbindung wurde erfolgreich hergestellt. Client Feedback senden.
        });
        webServer.listen(3001, () => {
            console.log(
            `WebSocket Server wurde gestartet. Adresse = http://localhost:3001`
            );
        });
    }
    //Quelle: https://gitlab.com/StStumpf/et-chat/-/blob/fad9672c45c9120bd8cb8e951ee3d7400ae7f8cd/chat.js
    sendMessageToAllClients (message){
        this.webSocketServer.clients.forEach((k) => {
            k.send(
              JSON.stringify({
                message: message
              })
            );
        })
    };
    async lastRow (){
        const DB = new MariaDB();
        try{
            setInterval(()=>{
                DB.latestRow().then(x => { 
                    this.sendMessageToAllClients(x); 
                });
                DB.sendMetrics().then(x => {
                    this.sendMessageToAllClients(x);
                });
            
            },2000);
        }catch(err){
            console.log(err);
        }
    }  
    
}

const socket = new WS(webServer); 
 // latestRow.LatestRow().then(x => { 
//     socket.sendMessageToAllClients(x); 
// })



// app.get("/", (req, res) => {
//      res.send(socket.messages);
//   });

