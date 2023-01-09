// dieses Programm berechnet den Mittelwert, das Maximum und das Minimum der Werte aus der Mysql tabelle und sendet sie dem WS-Server
const mysql = require('mysql2');
const WebSocket = require('ws');
require('dotenv').config( );
const functions = require("./services");

let connection;
process.on('exit', () => {
    connection.end();
  });
  
  // Mysql connection schließen wenn strg+C gedrückt wird
process.on('SIGINT', () => {
    console.log('Closing MySQL connection and exiting...');
    connection.end();
    process.exit();
});
async function sendMetrics() {
  try {
    connection = functions.DB().promise();
    const query = `
      SELECT MAX(Messwert), MIN(Messwert), AVG(Messwert)
      FROM messergebnisse
      WHERE InDtTm BETWEEN NOW() - INTERVAL 1 DAY AND NOW();
    `;
    const ws = new WebSocket('ws://localhost:3001');
    ws.on('open', async () => {
      const [results] = await connection.query(query);
      ws.send(JSON.stringify(results[0]));
      // Warte 2 Sekunden bevor die nächste daten gesendet werden
      return;
    });
    ws.on('error', (error) => {
      console.error(error);
      ws.close(1000, error.message);
      setTimeout(sendMetrics,5000);
    });
  } catch (error) {
    console.error(error);
    ws.close(1000, error.message);
    setTimeout(sendMetrics,5000);
  }

}

setInterval(sendMetrics, 1000);


// const metrics = functions.DB().query('SELECT MAX(Messwert),MIN(Messwert),AVG(Messwert) FROM messergebnisse WHERE InDtTm BETWEEN NOW() - INTERVAL 1 DAY AND NOW();', (err, result) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     else{
//         ws = new WebSocket('ws://localhost:3001');
//         ws.on('open', () => {
//             ws.send(JSON.stringify(result[0]));
//         })
//     }
// });

// const avgValue = functions.DB().query('SELECT AVG(Messwert) FROM messergebnisse WHERE InDtTm BETWEEN NOW() - INTERVAL 1 DAY AND NOW();', (err, result) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     ws = new WebSocket('ws://localhost:3001');
//     ws.on('open', () => {
//         ws.send(JSON.stringify(result[0]));
//     })
// });
