// dieses Programm alle Zeilen einer Mysql tabelle und sendet sie dem WS-Server

const mysql = require('mysql2');
const WebSocket = require('ws');
require('dotenv').config( );
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
async function sendData(formatted_Results) {
  try {
    const ws = new WebSocket('ws://localhost:3001');
    
    let messageCounter = 0;
    ws.on('open', () => {
      formatted_Results.forEach((row)=> {
        ws.send(JSON.stringify(row));
        messageCounter++;
        // prüfen ob alle Daten gesendet wurden, und dann abbrechen
        if (messageCounter === formatted_Results.length) {
          console.log('All messages sent, exiting process...');
          process.exit();
        }
      })
    });
    ws.on('error', (error) => {
      console.error(error);
      ws.close(1000, error.message);
      setTimeout(() => {
        // wenn Econnrefused dann 5sek warten und nochmal versuchen
        sendData(formatted_Results);
      }, 5000);
    });
  } catch (error) {
    console.error(error);
    setTimeout(() => {
      // bei einem Fehler 5 sekunden warten und dann nochmakversuchen
      sendData(formatted_Results);
    }, 5000);
  }
}

async function getDataAndSend() {
  try {
    connection = functions.DB().promise();
    const [results] = await connection.query('SELECT * FROM messergebnisse ORDER BY ID');
    let formatted_Results=[];
    //wenn tabelle daten enthält dann werden die zeilen jeweils formatiert und gesendet
    if (results.length > 0) {
      results.forEach((row) => {
        const data = {
          value: row.Messwert,
          timestamp: row.InDtTm.toISOString().replace(/T/, ' ').replace(/\..+/, '') 
        };
        formatted_Results.push(data);
      });
      sendData(formatted_Results);
    }
  } catch (error) {
    console.error(error);
    setTimeout(getDataAndSend, 5000);
  }
}

getDataAndSend();
