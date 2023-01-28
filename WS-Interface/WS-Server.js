"use strict";
const express = require("express");
const http = require("http");
const WSocket = require("./WS.js");

const app = express(); // über dem Webserver soll eine exüress webanwendung laufen
const webServer = http.createServer(app); //webserver bauen
app.use(express.static("html"));

app.get("/", (req, res) => {
  res.send();
});

app.get("/api/now", (req, res) => {
  return res.send(`${new Date()}`);
});

app.listen(3000, () => {
  console.log("Server gestartet. http://localhost:3000");
});

const socket = WSocket(webServer);
