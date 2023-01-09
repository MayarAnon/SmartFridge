// dieses Programm holt die letzte ( aktuelleste ) Zeile aus einer Mysql tabelle und sendet sie dem WS-Server
//die SQl Tabelle wurde wie folgt erstellt  

// CREATE TABLE `messergebnisse` (
//     `ID` int NOT NULL AUTO_INCREMENT,
//     `Messwert` decimal(3,1) NOT NULL,
//     `InDtTm` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     PRIMARY KEY (`ID`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

const mysql = require('mysql2');
const WebSocket = require('ws');
require('dotenv').config();
const functions = require("./services");
let connection;
process.on('exit', () => {
    connection.end();
});
//Mysql connection schließen wenn Strg+C gedrückt wird 
process.on('SIGINT', () => {
    console.log('Closing MySQL connection and exiting...');
    connection.end();
    process.exit();
});
async function sendLatestRow() {
  try {
    connection = await functions.DB().promise();
    const [rows] = await connection.query('SELECT * FROM messergebnisse ORDER BY ID DESC LIMIT 1');
    if (rows.length === 0) {
      console.log("No rows found in the table");
      return;
    }
    //Zeile formatieren
    const row = {
      value: rows[0].Messwert,
      timestamp: rows[0].InDtTm.toISOString().replace(/T/, ' ').replace(/\..+/, '') 
    };
    const data = JSON.stringify(row);

    const ws = new WebSocket('ws://localhost:3001');
    await ws.on('open', () => {
      ws.send(data);
      return;
    });
    ws.on('error', (error) => {
      console.error(error);
      ws.close(1000, error.message);
      setTimeout(sendLatestRow,5000);
    });
  } catch (err) {
    console.error(err);
    ws.close(1000, error.message);
    setTimeout(sendLatestRow,5000);
  }
}

setInterval(sendLatestRow, 1000);



