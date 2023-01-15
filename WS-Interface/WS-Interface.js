
const WebSocket = require('ws');
const MariaDB = require("./MariaDB");
const MQTT = require("async-mqtt");
const topicList = {
    doorState: "doorState"
  };
// Die Klasse integriert ein Websocket(Port 3001) in dem webServer, welcher als Parameter übergeben werden muss.
// Wenn das Websocket erfolgreich integriert wurde, werden kommenden Nachrichten über WS ausgegeben
// Außerdem werden die Aktuelle Temperatur und die Kennzahlen jede Sekunde an alle Clients verschickt
class WS 
{
    constructor(webServer) 
    {
        this.doorState = "";
        this.messages =[];
        this.webSocketServer = new WebSocket.Server({ server: webServer });
        this.webSocketServer.on("connection", (ws) => {
            ws.on("message", (message) => {
                console.log(`Neue Nachricht per Websocket erhalten: '${message}'`);
            });
            this.sendRealTimeData(ws);
        });
        webServer.listen(3001, () => {
            console.log(`WebSocket Server wurde gestartet. Adresse = http://localhost:3001`);
        });
    }
    //Die Methode sendet eine Nachricht an alle WS-Clients als JSON-String.
    // Die Nachricht wird als Parameter der Methode übergeben (message:String)
    async sendMessage(topic,message) 
    {
        try
        {
        this.webSocketServer.clients.forEach((k) => {
            k.send(
                JSON.stringify({
                    topic:topic,
                    message: message
                })
            );
        })
        }
        catch(err)
        {
            this.handleError(err);
        }
    }
    //Die Methode verbindet sich mit der Datenbank und sendet die letzte Zeile, sowie das Maximum/Minimun und den Mittelwert der Messdaten
    //der letzten 24h über WS. Die Methode verbindet sich außerdem mit dem MQTT Broker und sendet den Öffnungszustand des Kühlschranks über WS 
    async sendRealTimeData() 
    {
        const DB = new MariaDB();
        const client = await MQTT.connectAsync(process.env.BROKER_URL)

        const topics = Object.values(topicList);
        client.subscribe(topics);

        try 
        {
            client.on('message', (topic, message) => {
                 this.sendMessage("DoorState",message.toString());
            });
            
            setInterval(async()=>{
                const latestRow = await DB.sendLatestRow();
                this.sendMessage("LatestTemp",latestRow);
                const metrics = await DB.sendMetrics();
                this.sendMessage("Metrics",metrics);
            },2000);
        } 
        catch (err) 
        {
            this.handleError(err);
        } 
    }
    handleError(err) 
    {
        console.error(err);
    }
}

module.exports = WS;
//const socket = new WS(webServer);

 // latestRow.LatestRow().then(x => { 
//     socket.sendMessageToAllClients(x); 
// })