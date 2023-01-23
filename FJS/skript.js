//Die funktion prüft ob der Wert eines HTML Tags eine ganze Zahl oder eine Kommazahl mit einer nachkommastelle ist
function isNumeric(elem,helperMsg)
{
	var numericExpression = /^[0-9]+(\.[0-9]{1})?$/;
	if(elem.value.match(numericExpression)){
        return true;
	}else{
		alert(helperMsg);
		elem.focus();
        return false;
	}
}
//Die funktion prüft ob der Wert eines HTML Tags eine gültige Emailformat hat
function isEmail(elem, helperMsg) 
{
    var emailExpression = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if(elem.value.match(emailExpression)) 
    {
        return true;
    } else
    {
        alert(helperMsg);
        elem.focus();
        return false;
    }
}
//die Funktion wandelt ein javascript date objekt in einem String mit der Format YYYY-MM-DD hh:mm:ss
function dateToString(dateToConvert) 
{
    if ((dateToConvert instanceof Date))
    {
        dateToConvert =dateToConvert.toISOString();
    }
    const date =dateToConvert.substring(0, (dateToConvert.indexOf("T") | 0));
    const time = dateToConvert.substring((dateToConvert.indexOf("T")+1| 0),(dateToConvert.indexOf("T")+9 | 0));
    return (date +" "+time);
}



const dateRef = document.getElementById("datum");
const timeRef = document.getElementById("uhrzeit");
var sysDate;
var sysTime;
//Die funktion formattiert und speichert die Systemzeit/datum in den Variable sysDate und sysTime 
setSystemTime = (SystemTime)=>{
    //DatumUndZeitRef.value = SystemTime;
    sysDate = dateToString(SystemTime).slice(0,10);
    sysTime = dateToString(SystemTime).slice(10,19);
    dateRef.innerHTML=sysDate;
    timeRef.innerHTML=sysTime;
}


const maxRef = document.getElementById('maximum');
const minRef = document.getElementById('minimum');
const avgRef = document.getElementById('avg');
const tempInsideRef = document.getElementById('tempinside');
const doorStateRef = document.getElementById('doorstate');
//Die funktion erstellt ein WS Client und  verarbeitet die eingehende Nachrichten
initWebsocket = () => {
    try{
        const ws = new WebSocket('ws://localhost:3001')
        ws.onopen = function () 
        {
            console.log(`Erfolgreich mit WebSocket verbunden`)
        }
        ws.onmessage = function (messageEvent) 
        {
            const data = JSON.parse(messageEvent.data);
            //console.log(`Neue Nachricht empfangen`, data)
            if (data.topic === "SystemTime") 
            {
                setSystemTime(data.message)
            }
            if (data.topic ==='Metrics')
            {
                const str= JSON.parse(data.message);
                maxRef.value=Object.values(str)[0] + ' °C';
                minRef.value=Object.values(str)[1]+ ' °C';
                avgRef.value=Object.values(str)[2]+ ' °C';
            }
            if (data.topic ==='DoorState')
            {
                doorStateRef.value= data.message;
            }
            if (data.topic ==='LatestTemp')
            {
                tempInsideRef.value= JSON.parse(data.message).value+ ' °C';
                
            }
        }
        ws.onerror=function()
        {
            alert("Der Websocketserver kann nicht erreicht werden");
        }
    }
    catch(err)
    {
        console.log(err);
        
    }

}


const tempLimitRef = document.getElementById('tempschwellwert');
const currentTempLimitRef = document.getElementById('akteullertempschwellwert');
//die Funktion ist für die Verarbeitung von der Benutzereingabe "Temperaturschwellwert"
setTempLimitValue = ()=>{
    if(isNumeric(tempLimitRef,"Bitte nur Kommazahlen mit maximal einer Nachkommastelle eingeben!!"))
    {
        console.log(tempLimitRef.value);
        currentTempLimitRef.value = tempLimitRef.value + " °C";
    }
}

const timeLimitRef = document.getElementById('maxzeit');
const currentTimeLimitRef = document.getElementById('akteullemaxzeit');
//die Funktion ist für die Verarbeitung von der Benutzereingabe "maximale öffnungszeit"
setTimeLimitValue = ()=>{
    if(isNumeric(timeLimitRef,"bitte Zeit in minuten eingeben!!"))
    {
        console.log(timeLimitRef.value);
        currentTimeLimitRef.value = timeLimitRef.value + "min";
    }
}


const lastDeletetRef = document.getElementById('lastdelete');
const deleteHistoryRef = document.getElementById('deletehistory');
//die Funktion ist für die Verarbeitung von der Benutzereingabe "Löschen"
deleteHistory = ()=>{
    lastDeletetRef.value = sysDate +" "+ sysTime;
}


const emailadresseRef = document.getElementById('emailadresse');
const setEmailAdresseRef = document.getElementById('setemailadresse');
//die Funktion ist für die Verarbeitung von der Benutzereingabe "Emailadresse"
setEmailAdresse = ()=>{
    if(isEmail(setEmailAdresseRef,"bitte eine gültige Emailadresse eingeben!!"))
    {
        console.log(setEmailAdresseRef.value);
        emailadresseRef.value = setEmailAdresseRef.value;
    }
}


tempdata = [
    { x: '2023-01-21T18:30:10', y: 12 },
    { x: new Date('2023-01-21T19:30:00'), y: 12 },
    { x: new Date('2023-01-21T22:30:00'), y: 42 },
    { x: '2023-01-22T01:00:00', y: 2 },
    { x: new Date('2023-01-22T02:00:00'), y: 11 },
    { x: new Date('2023-01-23T03:00:00'), y: 44 }
]
const tableRef = document.getElementById('messwertetabelle');
//die Funktion füllt die HTML Tabelle mit daten aus
filltable = ()=>{
    for (let i = 0; i < tempdata.length; i++) 
    {
        let newRow = tableRef.insertRow(tableRef.length);
        let cell1 = newRow.insertCell(0);
        let cell2 = newRow.insertCell(1);
        cell1.innerHTML = dateToString(tempdata[i].x)
        cell2.innerHTML = tempdata[i].y;
    }
}





initWebsocket()
filltable()