
let tempData= [];

//Das Objekt stellt die Zeit in der richtigen Format und in der richtigen Zeitzone
const DateFormatter = {
    //Die funktion gibt die Zeit in folgender Format zurück: YYYY-MM-DDThh:mm:ss
    //Die Zeit kann als String oder als Date objekt übergeben werden
    getFormattedDate(dateToConvert) {
      if (!(dateToConvert instanceof Date)) {
        dateToConvert = new Date(dateToConvert);
      }
      dateToConvert.setTime(dateToConvert.getTime() + 60 * 60 * 1000);
      let isoDate = dateToConvert.toISOString().slice(0, 19);
      return isoDate;
    },
    //die Funktion wandelt ein javascript date objekt in einem String mit der Format YYYY-MM-DD hh:mm:ss
    dateTime(dateToConvert) {
      dateToConvert = this.getFormattedDate(dateToConvert);
      const date = dateToConvert.substring(0, dateToConvert.indexOf("T") | 0);
      const time = dateToConvert.substring(
        (dateToConvert.indexOf("T") + 1) | 0,
        (dateToConvert.indexOf("T") + 9) | 0
      );
      return date + " " + time;
    },
  };

//Die Funktion sendet POST Requests an dem RESTAPI.  URL und die Nachricht werden als parameter übergeben
function transmit(adress, container, value) {
    let object = { container, value };
    fetch(adress, {
      method: "POST",
      body: JSON.stringify(object),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

//Die Klasse erstellt ein WS Client und  verarbeitet die eingehende Nachrichten

class WSClient{
  constructor() {
    this.dateRef = document.getElementById("systemDate");
    this.timeRef = document.getElementById("systemTime");
    this.maxRef = document.getElementById("max");
    this.minRef = document.getElementById("min");
    this.avgRef = document.getElementById("avg");
    this.tempInsideRef = document.getElementById("tempInside");
    this.doorStateRef = document.getElementById("doorState");
    this.websocketUrl = "ws://localhost:3001";
    this.ws = new WebSocket(`${this.websocketUrl}`);
    if (!WSClient.instance) {
      WSClient.instance = this;
    }
    this.#initWebsocket(this.ws)
    this.renderMessages(this.ws);
    return WSClient.instance;
  }
  //Mit der Methode wird überprüft ob eine Websocket verbindung steht
  #initWebsocket(ws){
    try {
      ws.onopen = function () {
        console.log(`Erfolgreich mit WebSocket verbunden`);
        ws.send("connected");
      };
      ws.onerror = function (err) {
        alert(
          `Der Websocketserver kann nicht erreicht werden. \n sehe console für mehr information`
        );
        console.log(`err: ${err}`);
      };
      window.addEventListener("unload", function () {
        //ws.send("closing")
        if (ws.readyState == WebSocket.OPEN) ws.close();
      });
    } catch (err) {
      console.log(err);
    }
  }
  //Die funktion formattiert  die Systemzeit/datum in den Variable und setzt die in HTML Tags ein
  setSystemTime(SystemTime){
    //DatumUndZeitRef.value = SystemTime;
    this.sysDate = DateFormatter.dateTime(SystemTime).slice(0, 10);
    this.sysTime = DateFormatter.dateTime(SystemTime).slice(10, 19);
    this.dateRef.innerHTML = this.sysDate;
    this.timeRef.innerHTML = this.sysTime;
  }
  //Die Methode verarbeitet die eingehenden MQTT Nachrichten, 
  //als Parameter bekommt die Methode den erstellten WSClient
  renderMessages(ws){
    const client = this;
    ws.onmessage = function (messageEvent) {
      const data = JSON.parse(messageEvent.data);
      switch (data.topic) {
        case "SystemTime": {
          client.setSystemTime(data.message);
          break;
        }
        case "Metrics": {
          const str = JSON.parse(data.message);
          client.maxRef.innerHTML = Object.values(str)[0] + " °C";
          client.minRef.innerHTML = Object.values(str)[1] + " °C";
          client.avgRef.innerHTML = Object.values(str)[2] + " °C";
          break;
        }
        case "DoorState": {
          client.doorStateRef.innerHTML = data.message;
          
          break;
        }
        case "LatestTemp": {
          const tempInside = JSON.parse(data.message).value;
          client.tempInsideRef.innerHTML = tempInside + " °C";
          tempData.push({
            x: DateFormatter.getFormattedDate(new Date()),
            y: tempInside,
          });
          console.log(tempData)
          break;
        }
        default: {
          console.log(
            `error in initwebsocket topic: ${data.topic} message: ${data.message}`
          );
        }
      }
    }}
    
}


export {WSClient, transmit, DateFormatter,tempData};