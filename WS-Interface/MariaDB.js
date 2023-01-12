const mariadb = require('mariadb');

require('dotenv').config( );

class MariaDB {
    
  constructor() {
    this.pool = mariadb.createPool({
        user: process.env.Mysql_User,
        password: process.env.Mysql_Password,
        host: process.env.Mysql_Host,
        port: 3306,
        database: 'test'
    });
  }

 

  async query(sql) {
    let conn;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query(sql);
      rows.forEach(element => {
        console.log(element.ID)
      });

    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
  async sendMetrics() {
    let conn;
    try {
      conn = await this.pool.getConnection();
      const query = `
        SELECT MAX(Messwert), MIN(Messwert), AVG(Messwert)
        FROM messergebnisse
        WHERE InDtTm BETWEEN NOW() - INTERVAL 1 DAY AND NOW();
      `;
      const [results] = await conn.query(query);
      return JSON.stringify(results);
    } catch (error) {
      console.error(error);
    }finally {
      if (conn) conn.release();
    }
  }
  async latestRow() {
    let conn;
    try {
      conn = await this.pool.getConnection();
      const [row] = await conn.query('SELECT * FROM messergebnisse ORDER BY ID DESC LIMIT 1');
      //Zeile formatieren
      const formattedRow = {
        value: row.Messwert,
        timestamp: row.InDtTm.toISOString().replace(/T/, ' ').replace(/\..+/, '') 
      };
  
      return JSON.stringify(formattedRow);
    
      } catch (err) {
        console.error(err);
    
      }finally {
        if (conn) conn.release();
      }
    }
}

// const DB = new MariaDB();
// DB.latestRow().then(x => {
//   console.log(x);
// })


// DB.sendMetrics().then(x => {
//   console.log(x);
// })
module.exports= MariaDB;

// Methode um die Letzte Zeile auszulesen
// async function LatestRow(connection) {
//   try {
//     const [rows] = await connection.query('SELECT * FROM messergebnisse ORDER BY ID DESC LIMIT 1');
//     if (rows.length === 0) {
//       console.log("Keine Zeilen in der Tabelle");
//       return;
//     }
//     //Zeile formatieren
//     const row = {
//       value: rows[0].Messwert,
//       timestamp: rows[0].InDtTm.toISOString().replace(/T/, ' ').replace(/\..+/, '') 
//     };

//     return row;

//   } catch (err) {
//     console.error(err);

//   }
// }


// async function sendMetrics(connection) {
//   try {
//     const query = `
//       SELECT MAX(Messwert), MIN(Messwert), AVG(Messwert)
//       FROM messergebnisse
//       WHERE InDtTm BETWEEN NOW() - INTERVAL 1 DAY AND NOW();
//     `;
//     const [results] = await connection.query(query);
//     return(results[0]);
//   } catch (error) {
//     console.error(error);
//   }
// }




