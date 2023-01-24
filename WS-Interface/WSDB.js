
const MariaDB = require('../DB_Connection/mariaDB');



class WSDB extends MariaDB
{
    
  constructor() {
    super()
  }


  //Die Funktion gibt das Max,Min und den Mittelwert der Messdaten für die letzten 24 stunden zurück
  async sendMetrics() 
  {
    try 
    {
      const query = `
        SELECT MAX(Messwert), MIN(Messwert), AVG(Messwert)
        FROM messergebnisse
        WHERE InDtTm BETWEEN NOW() - INTERVAL 60 DAY AND NOW();
      `;
      const [results] = await super.query(query);
      
      return JSON.stringify(results);

    } 
    catch (error) 
    {
      console.error(error);
    }
  }
//Die Funktion gibt den letzten Messwert aus der Tabelle zurück
  async sendLatestRow() 
  {
    try 
    {
      const query = 'SELECT * FROM messergebnisse ORDER BY ID DESC LIMIT 1';
      const [row] = await super.query(query);

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
    }
}


module.exports= WSDB;

// const db = new WSDB()


// db.sendLatestRow().then(x => {
//     console.log(x);
//   })







//die SQl Tabelle wurde wie folgt erstellt  

// CREATE TABLE `messergebnisse` (
//     `ID` int NOT NULL AUTO_INCREMENT,
//     `Messwert` decimal(3,1) NOT NULL,
//     `InDtTm` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     PRIMARY KEY (`ID`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;