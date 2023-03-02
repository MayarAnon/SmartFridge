//Dieses Skript wird in keiner Seite geladen und stellt nur eine Sammlung an häufig verwendete Funktionen

let tempData = [];

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
  //die Funktion wandelt ein javascript date objekt in einem String mit der Format DD.MM.YYYY hh:mm:ss
  dateTime(dateToConvert) {
    if (!(dateToConvert instanceof Date)) {
      dateToConvert = new Date(dateToConvert);
    }
    let newDateString =
      dateToConvert.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      dateToConvert.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    return newDateString;
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

//Die Klasse stellt ein WS Client dar
class WSClient {
  constructor() {
    this.dateRef = document.getElementById("systemDate");
    this.timeRef = document.getElementById("systemTime");
    this.maxRef = document.getElementById("max");
    this.minRef = document.getElementById("min");
    this.avgRef = document.getElementById("avg");
    this.tempInsideRef = document.getElementById("tempInside");
    this.tempOutsideRef = document.getElementById("tempOutside");
    this.doorStateRef = document.getElementById("doorState");
    this.websocketUrl = "ws://" + window.location.hostname + ":443";

    this.ws = new WebSocket(`${this.websocketUrl}`);
    if (!WSClient.instance) {
      WSClient.instance = this;
    }
    this.#initWebsocket(this.ws);

    return WSClient.instance;
  }
  //Mit der Methode wird überprüft ob eine Websocket verbindung steht
  #initWebsocket(ws) {
    try {
      ws.onopen = function () {
        console.log(`Erfolgreich mit WebSocket verbunden`);
        ws.send(
          JSON.stringify({
            pageName: location.href.split("/").slice(-1),
          })
        );
      };
      ws.onerror = function (err) {
        alert(
          `Der Websocketserver kann nicht erreicht werden. \n sehe console für mehr information`
        );
        console.log(`err: ${err}`);
      };
      window.addEventListener("unload", function () {
        if (ws.readyState == WebSocket.OPEN) ws.close();
      });
    } catch (err) {
      console.log(err);
    }
  }
  //Die funktion formattiert  die Systemzeit/datum in den Variable und setzt die Werte in den HTML Tags ein
  setSystemTime(SystemTime) {
    this.sysDate = DateFormatter.dateTime(SystemTime).slice(0, 10);
    this.sysTime = DateFormatter.dateTime(SystemTime).slice(10, 19);
    this.dateRef.innerHTML = this.sysDate;
    this.timeRef.innerHTML = this.sysTime;
  }
}

//Die funktion prüft ob der Wert eines HTML Tags eine ganze Zahl oder eine Kommazahl mit einer nachkommastelle ist
function isNumeric(elem, helperMsg) {
  var numericExpression = /^[0-9]+(\.[0-9]{1})?$/; //https://www.regular-expressions.info/numericranges.html
  if (elem.value.match(numericExpression)) {
    return true;
  } else {
    alert(helperMsg);
    elem.focus();
    return false;
  }
}

//Die funktion prüft ob der Wert eines HTML Tags eine gültige Emailformat hat
function isEmail(elem, helperMsg) {
  var emailExpression = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; //https://www.regular-expressions.info/email.html
  if (elem.value.match(emailExpression)) {
    return true;
  } else {
    alert(helperMsg);
    elem.focus();
    return false;
  }
}

export { WSClient, transmit, DateFormatter, tempData, isNumeric, isEmail };
