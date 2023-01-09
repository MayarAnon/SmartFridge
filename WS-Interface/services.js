const mysql = require('mysql2');
const WebSocket = require('ws');
require('dotenv').config( );

const config = {
    user: process.env.Mysql_User,
    password: process.env.Mysql_Password,
    host: process.env.Mysql_Host,
    port: 3306,
    database: 'test'
};

// ............................stellt eine Verbindung zur der Datenbank
const connectDB = () =>{
    return mysql.createConnection(
        config, err => {
            if (err) {
                console.error(err);
                return;
            }
        }
    )
}

//..........................sendet data von einem websocket client
const sendData = function(data) {ws = new WebSocket('ws://localhost:3001');
    ws.on('open', () => {
        ws.send(JSON.stringify(data));
    })
};

//..........................gibt einen zufälligen element von einem Array

// Array.prototype.random = function () {
//     return this[Math.floor((Math.random()*this.length))];
//   }      //zum aufrufen: ["closed","open"].random()

function random(array) {
    return array[Math.floor(Math.random() * array.length)];
  }





module.exports = {DB: connectDB, ws: sendData, random:random} 
