const { Socket } = require("dgram");
const express = require("express");
const http = require("http");
const WSocket = require("./WS-Interface.js")

const app = express();    // über dem Webserver soll eine exüress webanwendung laufen
const webServer = http.createServer(app);   //webserver bauen
app.use(express.static("html"));

 app.get("/", (req, res) => {
   res.send();
});

app.listen(3000, () => {
  console.log("Server gestartet. http://localhost:3000");
});



const socket = new WSocket(webServer);