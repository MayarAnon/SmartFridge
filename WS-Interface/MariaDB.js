"use strict";
const mariadb = require('mariadb');

require('dotenv').config({path:__dirname+'/../.env'});

class MariaDB 
{
    
  constructor() 
  {
    this.pool = mariadb.createPool({
        user: process.env.Mysql_User,
        password: process.env.Mysql_Password,
        host: process.env.Mysql_Host,
        port: 3306,
        database: 'test'
    });
  }

 
  //Die Funktion gibt das Max,Min und den Mittelwert der Messdaten für die letzten 24 stunden zurück
  async sendMetrics() 
  {
    const conn = await this.pool.getConnection();
    try 
    {
      const query = `
        SELECT MAX(Messwert), MIN(Messwert), AVG(Messwert)
        FROM messergebnisse
        WHERE InDtTm BETWEEN NOW() - INTERVAL 60 DAY AND NOW();
      `;
      const [results] = await conn.query(query);
      
      return JSON.stringify(results);

    } 
    catch (error) 
    {
      console.error(error);
    }
    finally 
    {
      if (conn) conn.release();
    }
  }
//Die Funktion gibt den letzten Messwert aus der Tabelle zurück
  async sendLatestRow() 
  {
    const conn = await this.pool.getConnection();
    try 
    {
      const query = 'SELECT * FROM messergebnisse ORDER BY ID DESC LIMIT 1';
      const [row] = await conn.query(query);

      //Zeile formatieren
      const formattedRow = JSON.stringify({
        value: row.Messwert,
        timestamp: row.InDtTm.toISOString().replace(/T/, ' ').replace(/\..+/, '') 
      });
  
      return formattedRow;
    
      } 
      catch (err) 
      {
        console.error(err);
    
      }
      finally 
      {
        if (conn) conn.release();
      }
    }
  async deleteTable() 
  {
    const conn = await this.pool.getConnection();
    try 
    {
      const query = 'TRUNCATE TABLE messergebnisse';
      await conn.query(query);
      console.log("Tabelle wurde geleert");
      } 
      catch (err) 
      {
        console.error(err);
    
      }
      finally 
      {
        if (conn) conn.release();
      }
  }

}

// const DB = new MariaDB();
// DB.deleteTable();
// DB.sendLatestRow().then(x => {
//    console.log(x);
//  })


// DB.sendMetrics().then(x => {
//  console.log(x);
//  })
module.exports= MariaDB;











//die SQl Tabelle wurde wie folgt erstellt  

// CREATE TABLE `messergebnisse` (
//     `ID` int NOT NULL AUTO_INCREMENT,
//     `Messwert` decimal(3,1) NOT NULL,
//     `InDtTm` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     PRIMARY KEY (`ID`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;