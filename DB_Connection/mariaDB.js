
const mariadb = require('mariadb');
const config = new (require('../Configmanager/config'))()



// Klasse für die Verbindung mit der Datenbank mariaDB
// Stellt sicher, dass nur eine Verbindung pro Service existiert
// Stellt sicher, dass die Verbindung aufrecht erhalten wird
//Parameter: loginDaten als Objekt 

class dbConnection
{
    //Initalisiert das Objekt 
    //Stellt sicher das nur ein Objekt existiert in einem Service
    //Parameter: Login-Daten als Obejkt 
    
    constructor()
    {
        //if (!dbConnection.instance) 
        //{
        //    dbConnection.instance = this
        //}

        
        
        this.loginData = config.get('loginDataDatabase')
        this.connection
        this.connectionCount = 0

        //return dbConnection.instance
        
    }

    //Verbindet mit Datenbank + schaut das nur eine Verbindung besteht
    //Parameter: keine
    //Rückgabewert: Verbindung zur Datenbank
    
    async reconnect()
    {
        if(this.connectionCount == 0)
        {
            this.connection = await mariadb.createConnection(this.loginData)
            if(this.connection.isValid){
                this.connectionCount ++
            }
        }
        
        return this.connection 
        
    }

    //Ermöglicht die Kommunikation mit der Datenbank über SQL
    //Parameter: SQL Befehl als string
    //return: die Ergebnisse aus der Datenbank als Objekt mit Meta-Daten
    
    async query(sqlCommand)
    {
        // Prüfen ob bereits eine Verbindung besteht, falls nicht aufbauen
        
        if(this.connectionCount == 0)
        {
            await this.reconnect()
        }
        //Prüfen ob die Verbindung in Ordnung ist
        
        if(!this.connection.isValid())
        {
            this.connectionCount --
            await this.reconnect()

        }

        // SQL Befehl senden und mögliche Antwort speicher

        const queryResult = await this.connection.query(sqlCommand)
        
        return queryResult
    }

    //gibt die Anzahl der Aktuellen Verbindungen zurück => Testzwecke

    async getConnectionCount()
    {
        return this.connectionCount
    }

    //Trennt die Verbindung

    destructor()
    {
        if(this.connection)
        {
            this.connection.relese()
        }
    }
}


module.exports = dbConnection









//Benutzung der Klasse

//Einbinden der Bibliothek 

//npm i mariadb

//Daten aus der Datenbank bekommen
/*
const instanceOne = new dbConnection()

const data = [];

async function nameOfFunctionOne()
{
    const sqlResult = await instanceOne.query('SELECT * FROM messergebnisse');
    
    //Daten formatieren 

    sqlResult.forEach(element => 
    {
        
        const tableEntry = 
        {
          ID : element.ID,
          timeStamp : element.timeStamp,
          Value : element.tempValue
        }
        
        data.push(tableEntry)
    })
    console.log(data)

} 

nameOfFunctionOne()
*/

//Daten in die Datenbank hinzufügen 
/*
const instanceTwo = new dbConnection(loginData)

const table = 'testen'
const currentID = 8
const currentTempValue = 9

async function nameOfFunctionTwo()
{
    const result = await instanceTwo.query(`INSERT INTO ${table} ('ID', 'timeStamp', 'tempValue') VALUES (${currentID}, NOW(), ${currentTempValue});`)
    console.log(result)
}

//nameOfFunctionTwo()
*/

